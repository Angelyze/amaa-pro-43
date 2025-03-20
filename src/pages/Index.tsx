import React, { useEffect, useRef, useState } from 'react';
import AMAAChatBox from '../components/AMAAChatBox';
import Header from '../components/Header';
import Logo from '../components/Logo';
import Message from '../components/Message';
import LoadingIndicator from '../components/LoadingIndicator';
import ConversationControls, { SavedConversation } from '../components/ConversationControls';
import { Button } from '@/components/ui/button';
import { Info, Heart, LogIn, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import UserMenu from '../components/UserMenu';

type MessageType = {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: string;
};

const Index = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mainSearchVisible, setMainSearchVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeMessageRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  const MAX_FREE_QUERIES = 5;
  
  const demoResponses = [
    "I'm AMAA, your AI assistant. I can help you find information, answer questions, and even search the web for the latest content. What would you like to know?",
    "The concept of minimalism in design emerged in the late 1960s as a reaction against the subjective expressionism of abstract expressionism. It emphasizes simplicity and objectivity, using clean lines, geometric shapes, and a monochromatic palette.",
    "According to recent studies, regular meditation can reduce stress, improve focus, and promote overall well-being. Even just 10 minutes of daily meditation has been shown to make a significant difference in cognitive function and emotional regulation.",
    "The James Webb Space Telescope, launched in December 2021, is the largest, most powerful space telescope ever built. It allows astronomers to observe the universe in unprecedented detail, including the formation of early galaxies and potential habitable exoplanets."
  ];
  
  const scrollToMessages = () => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToLatestMessage = () => {
    if (activeMessageRef.current) {
      activeMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const handleScroll = () => {
    if (!mainSearchRef.current) return;
    
    const mainSearchRect = mainSearchRef.current.getBoundingClientRect();
    const isVisible = mainSearchRect.bottom > 0;
    
    setMainSearchVisible(isVisible);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (messages.length > 0) {
      scrollToLatestMessage();
    }
  }, [messages]);
  
  const handleSendMessage = (content: string, type: 'regular' | 'web-search') => {
    if (!isLoggedIn && queryCount >= MAX_FREE_QUERIES) {
      toast.error('You have reached the maximum number of free queries. Please subscribe for unlimited access.');
      return;
    }
    
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!isLoggedIn) {
      setQueryCount(prev => prev + 1);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: type === 'web-search' ? 
          `Web search results for "${content}":\n\n${randomResponse}` : 
          randomResponse,
        type: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      setTimeout(scrollToLatestMessage, 100);
    }, 2000);
  };
  
  const handleUploadFile = (file: File) => {
    toast.success(`Uploaded file: ${file.name}`);
  };
  
  const handleVoiceInput = () => {
    toast.info('Voice input feature coming soon');
  };

  const handleNewConversation = () => {
    if (messages.length > 0) {
      if (confirm('Start a new conversation? This will clear the current conversation.')) {
        setMessages([]);
        scrollToTop();
      }
    }
  };

  const handleSaveConversation = (customTitle?: string) => {
    if (messages.length === 0) {
      toast.error('No conversation to save');
      return;
    }
    
    const firstUserMessage = messages.find(m => m.type === 'user');
    const defaultTitle = firstUserMessage 
      ? `${firstUserMessage.content.substring(0, 15)}${firstUserMessage.content.length > 15 ? '...' : ''}`
      : 'Conversation';
    
    const title = customTitle || defaultTitle;
    const dateStr = new Date().toLocaleDateString();
    const fullTitle = `${title} (${dateStr})`;
    
    const conversation: SavedConversation = {
      id: Date.now().toString(),
      title: fullTitle,
      messages: [...messages],
      savedAt: new Date().toISOString()
    };
    
    const existingConversationsStr = localStorage.getItem('savedConversations');
    const existingConversations = existingConversationsStr 
      ? JSON.parse(existingConversationsStr) 
      : [];
    
    const updatedConversations = [conversation, ...existingConversations];
    localStorage.setItem('savedConversations', JSON.stringify(updatedConversations));
    
    toast.success('Conversation saved successfully');
  };

  const handleLoadConversation = (conversation: SavedConversation) => {
    if (messages.length > 0) {
      if (!confirm('Load this conversation? Your current conversation will be replaced.')) {
        return;
      }
    }
    
    setMessages(conversation.messages);
    toast.success(`Loaded conversation: ${conversation.title}`);
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const savedConversationsStr = localStorage.getItem('savedConversations');
    if (!savedConversationsStr) return;
    
    try {
      const savedConversations = JSON.parse(savedConversationsStr);
      const updatedConversations = savedConversations.map((conv: SavedConversation) => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      );
      
      localStorage.setItem('savedConversations', JSON.stringify(updatedConversations));
      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const handleDeleteConversation = (id: string) => {
    const savedConversationsStr = localStorage.getItem('savedConversations');
    if (!savedConversationsStr) return;
    
    try {
      const savedConversations = JSON.parse(savedConversationsStr);
      const updatedConversations = savedConversations.filter(
        (conv: SavedConversation) => conv.id !== id
      );
      
      localStorage.setItem('savedConversations', JSON.stringify(updatedConversations));
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSubscribe = () => {
    toast.success('Opening subscription page');
    // Subscription page would be opened here in a real application
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
    toast.success(isLoggedIn ? 'Logged out successfully' : 'Logged in successfully');
    
    if (isLoggedIn) {
      window.location.reload();
    }
  };

  const displayMessages = [...messages].reverse();

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 -z-10 background-pattern"></div>
      
      <Header 
        mainSearchVisible={mainSearchVisible}
        onSendMessage={handleSendMessage}
        onScrollToTop={scrollToTop}
        isLoggedIn={isLoggedIn}
        onLogin={toggleLogin}
      />
      
      <main className="container mx-auto px-4 pt-12 flex-grow">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {isLoggedIn ? (
              <UserMenu onLogout={toggleLogin} />
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleLogin}
                  className="text-sm gap-1.5 hover:bg-teal/10 hover:text-teal transition-all"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Log in</span>
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleSubscribe}
                  className="bg-teal text-white hover:bg-teal-light hover:shadow-md transition-all text-sm gap-1.5"
                >
                  <CreditCard size={16} />
                  <span className="hidden sm:inline">Subscribe</span>
                </Button>
              </>
            )}
          </div>
          
          <div 
            ref={mainSearchRef}
            className="min-h-[50vh] flex flex-col items-center justify-center py-6"
          >
            <Logo />
            
            <div className="w-full max-w-3xl mt-8">
              <AMAAChatBox 
                onSendMessage={handleSendMessage}
                onUploadFile={handleUploadFile}
                onVoiceInput={handleVoiceInput}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Info size={12} />
              {isLoggedIn ? (
                <span>Thank you for using Premium!</span>
              ) : (
                <span>
                  Free users have {MAX_FREE_QUERIES} queries. {' '}
                  <button 
                    onClick={handleSubscribe} 
                    className="text-teal hover:text-teal-light hover:underline transition-all"
                  >
                    Go Premium
                  </button> {' '}
                  for unlimited access and more.
                </span>
              )}
            </div>

            {isLoggedIn && (
              <ConversationControls 
                onNewConversation={handleNewConversation}
                onSaveConversation={handleSaveConversation}
                onLoadConversation={handleLoadConversation}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                currentMessages={messages}
              />
            )}
          </div>
          
          {displayMessages.length > 0 && (
            <div 
              id="messages-section" 
              ref={messagesContainerRef} 
              className="w-full mx-auto mt-0 mb-8"
            >
              <div className="space-y-4">
                {isLoading && <LoadingIndicator />}
                
                {displayMessages.map((message, index) => (
                  <div 
                    key={message.id} 
                    ref={index === 0 ? activeMessageRef : null}
                  >
                    <Message
                      content={message.content}
                      type={message.type}
                      timestamp={message.timestamp}
                    />
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="footer-container">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="footer-nav">
              <a href="https://amaa.pro" className="footer-link">Home</a>
              <a href="https://amaa.pro/about" className="footer-link">About</a>
              <a href="https://amaa.pro/terms" className="footer-link">Terms</a>
              <a href="https://amaa.pro/privacy" className="footer-link">Privacy</a>
            </div>
            <div className="copyright">
              © Copyright 2025 <a href="https://amaa.pro" className="text-teal mx-1.5 hover:text-teal-light transition-colors">AMAA.pro</a>. Powered by AMAA <Heart size={12} className="text-teal ml-1.5 animate-pulse-gentle" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

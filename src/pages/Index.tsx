import React, { useEffect, useRef, useState } from 'react';
import AMAAChatBox from '../components/AMAAChatBox';
import Header from '../components/Header';
import Logo from '../components/Logo';
import Message from '../components/Message';
import LoadingIndicator from '../components/LoadingIndicator';
import ConversationControls from '../components/ConversationControls';
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
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  const demoResponses = [
    "I'm AMAA, your AI assistant. I can help you find information, answer questions, and even search the web for the latest content. What would you like to know?",
    "The concept of minimalism in design emerged in the late 1960s as a reaction against the subjective expressionism of abstract expressionism. It emphasizes simplicity and objectivity, using clean lines, geometric shapes, and a monochromatic palette.",
    "According to recent studies, regular meditation can reduce stress, improve focus, and promote overall well-being. Even just 10 minutes of daily meditation has been shown to make a significant difference in cognitive function and emotional regulation.",
    "The James Webb Space Telescope, launched in December 2021, is the largest, most powerful space telescope ever built. It allows astronomers to observe the universe in unprecedented detail, including the formation of early galaxies and potential habitable exoplanets."
  ];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      scrollToBottom();
    }
  }, [messages]);
  
  const handleSendMessage = (content: string, type: 'regular' | 'web-search') => {
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
      
      document.getElementById('messages-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
  };
  
  const handleUploadFile = (file: File) => {
    toast.info(`Uploaded file: ${file.name}`);
    
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: `I've uploaded ${file.name} for analysis.`,
      type: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: `I've analyzed ${file.name}. This appears to be a ${file.type.split('/')[1]} file. What would you like to know about it?`,
        type: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 3000);
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

  const handleSaveConversation = () => {
    if (messages.length > 0) {
      toast.success('Conversation saved successfully');
    } else {
      toast.error('No conversation to save');
    }
  };

  const handleLoadConversation = () => {
    toast.info('Load conversation feature coming soon');
  };

  const handleEditConversations = () => {
    toast.info('Edit conversations feature coming soon');
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
    toast.success(isLoggedIn ? 'Logged out successfully' : 'Logged in successfully');
  };

  const displayMessages = [...messages].reverse();

  return (
    <div className="min-h-screen flex flex-col">
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
            className="min-h-[60vh] flex flex-col items-center justify-center py-8"
          >
            <Logo />
            
            <div className="w-full max-w-3xl mt-12">
              <AMAAChatBox 
                onSendMessage={handleSendMessage}
                onUploadFile={handleUploadFile}
                onVoiceInput={handleVoiceInput}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
              <Info size={12} />
              <span>Free users have 5 queries. Go Premium for unlimited access.</span>
            </div>

            <ConversationControls 
              onNewConversation={handleNewConversation}
              onSaveConversation={handleSaveConversation}
              onLoadConversation={handleLoadConversation}
            />
          </div>
          
          {displayMessages.length > 0 && (
            <div id="messages-section" className="max-w-3xl mx-auto mt-12 mb-8">
              <div className="space-y-4">
                {isLoading && <LoadingIndicator />}
                
                {displayMessages.map((message) => (
                  <Message
                    key={message.id}
                    content={message.content}
                    type={message.type}
                    timestamp={message.timestamp}
                  />
                ))}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="w-full py-2 mt-auto bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm">
              <a href="https://amaa.pro" className="text-foreground hover:text-teal mr-6 transition-colors">Home</a>
              <a href="https://amaa.pro/about" className="text-foreground hover:text-teal mr-6 transition-colors">About</a>
              <a href="https://amaa.pro/terms" className="text-foreground hover:text-teal mr-6 transition-colors">Terms</a>
              <a href="https://amaa.pro/privacy" className="text-foreground hover:text-teal transition-colors">Privacy</a>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="flex justify-center items-center">
                © Copyright 2025 <a href="https://amaa.pro" className="text-teal mx-1 hover:text-teal-light transition-colors">AMAA.pro</a>. Powered by AMAA <Heart size={12} className="text-teal ml-1.5 animate-pulse-gentle" />
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

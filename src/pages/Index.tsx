
import React, { useEffect, useRef, useState } from 'react';
import AMAAChatBox from '../components/AMAAChatBox';
import Header from '../components/Header';
import Logo from '../components/Logo';
import Message from '../components/Message';
import LoadingIndicator from '../components/LoadingIndicator';
import ConversationControls from '../components/ConversationControls';
import { Button } from '@/components/ui/button';
import { Info, Heart, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import UserMenu from '../components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  Conversation,
  Message as MessageType,
  createConversation,
  createMessage,
  getConversations,
  getMessages,
  deleteConversation,
  updateConversationTitle,
  getGuestMessages,
  saveGuestMessage,
  getGuestQueryCount,
  incrementGuestQueryCount
} from '@/services/conversationService';
import { SavedConversation } from '@/components/ConversationControls';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_GUEST_QUERIES = 5;

const Index = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mainSearchVisible, setMainSearchVisible] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const [guestQueriesCount, setGuestQueriesCount] = useState(0);
  
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeMessageRef = useRef<HTMLDivElement>(null);
  
  // Load conversations for authenticated users
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      // Load guest messages
      const guestMessages = getGuestMessages();
      setMessages(guestMessages);
      setGuestQueriesCount(getGuestQueryCount());
    }
  }, [user]);

  // Load messages for current conversation
  useEffect(() => {
    if (currentConversationId && user) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, user]);
  
  const loadConversations = async () => {
    try {
      const conversationList = await getConversations();
      setConversations(conversationList);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    }
  };
  
  const loadMessages = async (conversationId: string) => {
    try {
      const messageList = await getMessages(conversationId);
      setMessages(messageList);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };
  
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
  
  const handleSendMessage = async (content: string, type: 'regular' | 'web-search') => {
    try {
      if (user) {
        // Authenticated user flow
        // Create a new conversation if needed
        let conversationId = currentConversationId;
        if (!conversationId) {
          const defaultTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
          const newConversation = await createConversation(defaultTitle);
          conversationId = newConversation.id;
          setCurrentConversationId(conversationId);
          setConversations([newConversation, ...conversations]);
        }
        
        // Add user message
        const userMessage = await createMessage(conversationId, content, 'user');
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
      } else {
        // Guest user flow
        // Check if guest has reached the query limit
        const queryCount = getGuestQueryCount();
        if (queryCount >= MAX_GUEST_QUERIES) {
          toast.error('You have reached the maximum number of queries as a guest. Please sign in to continue.');
          return;
        }
        
        // Increment guest query count
        const newCount = incrementGuestQueryCount();
        setGuestQueriesCount(newCount);
        
        // Add user message
        const userMessage = saveGuestMessage({ content, type: 'user' });
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
      }
      
      // Call our edge function
      const response = await supabase.functions.invoke('chat', {
        body: { message: content, conversationType: type },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Add assistant message
      const assistantContent = response.data.response;
      
      if (user) {
        // For authenticated users, save to database
        const assistantMessage = await createMessage(currentConversationId!, assistantContent, 'assistant');
        setMessages(prev => [...prev, assistantMessage]);
        
        // Refresh conversations list to get the updated one
        loadConversations();
      } else {
        // For guest users, save to local storage
        const assistantMessage = saveGuestMessage({ content: assistantContent, type: 'assistant' });
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      setTimeout(scrollToLatestMessage, 100);
    } catch (error) {
      console.error('Error in conversation:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
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
        setCurrentConversationId(null);
        scrollToTop();
      }
    }
  };

  const handleSaveConversation = async (customTitle?: string) => {
    if (!currentConversationId) {
      toast.error('No conversation to save');
      return;
    }
    
    try {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (!conversation) return;
      
      const title = customTitle || conversation.title;
      await updateConversationTitle(currentConversationId, title);
      
      // Refresh conversations
      loadConversations();
      
      toast.success('Conversation saved successfully');
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation');
    }
  };

  const handleLoadConversation = (conversation: SavedConversation) => {
    const conversationId = conversation.id;
    setCurrentConversationId(conversationId);
    toast.success(`Loaded conversation: ${conversation.title}`);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await updateConversationTitle(id, newTitle);
      
      // Refresh conversations
      loadConversations();
      
      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      
      // If we deleted the current conversation, clear it
      if (id === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      
      // Refresh conversations
      loadConversations();
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Map database messages to the format expected by the components
  const displayMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.created_at
  })).reverse();

  // Map conversations to the SavedConversation format
  const savedConversations: SavedConversation[] = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    messages: [],
    savedAt: conv.created_at
  }));

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 -z-10 background-pattern"></div>
      
      <Header 
        mainSearchVisible={mainSearchVisible}
        onSendMessage={handleSendMessage}
        onScrollToTop={scrollToTop}
        isLoggedIn={!!user}
        onLogin={() => {}} // We're using our custom auth now
      />
      
      <main className="container mx-auto px-4 pt-12 flex-grow">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {user ? (
              <UserMenu onLogout={signOut} />
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
          
          <div 
            ref={mainSearchRef}
            className="min-h-[50vh] flex flex-col items-center justify-center py-6"
          >
            <Logo />
            
            <div className="w-full max-w-3xl mt-8">
              {!user && guestQueriesCount > 0 && (
                <Alert className="mb-4">
                  <AlertDescription>
                    Guest mode: {guestQueriesCount}/{MAX_GUEST_QUERIES} queries used. 
                    <Link to="/auth" className="ml-2 text-primary hover:underline">
                      Sign in
                    </Link> for unlimited access.
                  </AlertDescription>
                </Alert>
              )}
              
              <AMAAChatBox 
                onSendMessage={handleSendMessage}
                onUploadFile={handleUploadFile}
                onVoiceInput={handleVoiceInput}
                disabled={!user && guestQueriesCount >= MAX_GUEST_QUERIES}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Info size={12} />
              <span>Ask me anything. I'm here to help!</span>
            </div>

            {user && (
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

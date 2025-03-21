
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
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
  incrementGuestQueryCount,
  GUEST_CONVERSATION_ID,
  clearGuestMessages
} from '@/services/conversationService';
import { SavedConversation } from '@/components/ConversationControls';

const MAX_GUEST_QUERIES = 5;

const Index = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mainSearchVisible, setMainSearchVisible] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { user, signOut, isPremium } = useAuth();
  const [guestQueriesCount, setGuestQueriesCount] = useState(0);
  
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (user) {
      loadConversations();
      
      if (isPremium) {
        setGuestQueriesCount(0);
      } else {
        const queryCount = getGuestQueryCount();
        setGuestQueriesCount(queryCount);
      }
      
      if (messages.length > 0 && !currentConversationId) {
        const guestMessages = getGuestMessages();
        const messagesMatch = messages.some(m => 
          guestMessages.some(gm => gm.id === m.id)
        );
        
        if (messagesMatch) {
          setMessages([]);
        }
      }
    } else {
      const guestMessages = getGuestMessages();
      setMessages(guestMessages);
      const queryCount = getGuestQueryCount();
      setGuestQueriesCount(queryCount);
      
      if (queryCount === MAX_GUEST_QUERIES - 1) {
        toast.warning(
          "You have 1 query left as a free user. Consider subscribing for unlimited access.",
          { duration: 5000 }
        );
      }
    }
  }, [user, currentConversationId, isPremium]);

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
  
  const scrollToLoadingIndicator = () => {
    if (loadingIndicatorRef.current) {
      loadingIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    if (isLoading && loadingIndicatorRef.current) {
      scrollToLoadingIndicator();
    }
  }, [isLoading]);
  
  const handleSendMessage = async (content: string, type: 'regular' | 'web-search') => {
    try {
      const userHasReachedLimit = !isPremium && guestQueriesCount >= MAX_GUEST_QUERIES;
      
      if (userHasReachedLimit) {
        toast.error(
          "You've reached the maximum number of free queries. Subscribe for unlimited access!",
          { 
            duration: 8000,
            action: {
              label: "Subscribe",
              onClick: () => window.location.href = "/subscribe"
            }
          }
        );
        return;
      }
      
      if (user) {
        let conversationId = currentConversationId;
        if (!conversationId) {
          const defaultTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
          const newConversation = await createConversation(defaultTitle);
          conversationId = newConversation.id;
          setCurrentConversationId(conversationId);
          setConversations([newConversation, ...conversations]);
        }
        
        const userMessage = await createMessage(conversationId, content, 'user');
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        
        if (!isPremium) {
          const newCount = incrementGuestQueryCount();
          setGuestQueriesCount(newCount);
          
          if (newCount === MAX_GUEST_QUERIES) {
            toast.warning(
              "This is your last free query. Subscribe for unlimited access.",
              { 
                duration: 5000,
                action: {
                  label: "Subscribe",
                  onClick: () => window.location.href = "/subscribe"
                }
              }
            );
          }
        }
      } else {
        const newCount = incrementGuestQueryCount();
        setGuestQueriesCount(newCount);
        
        if (newCount === MAX_GUEST_QUERIES) {
          toast.warning(
            "This is your last free query. Subscribe for unlimited access.",
            { 
              duration: 5000,
              action: {
                label: "Subscribe",
                onClick: () => window.location.href = "/subscribe"
              }
            }
          );
        }
        
        const userMessage = saveGuestMessage({ content, type: 'user' });
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
      }
      
      if (uploadedFile && type !== 'web-search') {
        await processFileWithQuestion(content, uploadedFile);
      } else {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        const response = await supabase.functions.invoke('ai-service', {
          body: { message: content, type },
          headers: session ? {
            'Authorization': `Bearer ${session.access_token}`
          } : {}
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        const assistantContent = response.data.response;
        
        if (user) {
          try {
            console.log('Creating message for user with conversation_id:', currentConversationId);
            const assistantMessage = await createMessage(currentConversationId!, assistantContent, 'assistant');
            setMessages(prev => [...prev, assistantMessage]);
            loadConversations();
          } catch (error) {
            console.error('Error creating assistant message:', error);
            toast.error('Failed to save assistant message, but here is the response:');
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              conversation_id: currentConversationId!,
              content: assistantContent,
              type: 'assistant',
              created_at: new Date().toISOString()
            }]);
          }
        } else {
          const assistantMessage = saveGuestMessage({ content: assistantContent, type: 'assistant' });
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error in conversation:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };
  
  const processFileWithQuestion = async (question: string, file: File) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const fileData = e.target?.result;
        if (!fileData) {
          toast.error('Error reading file');
          return;
        }
        
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        const response = await supabase.functions.invoke('ai-service', {
          body: { 
            message: question,
            type: 'upload',
            file: {
              name: file.name,
              type: file.type,
              data: fileData
            },
            photoContext: question
          },
          headers: session ? {
            'Authorization': `Bearer ${session.access_token}`
          } : {}
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        const assistantContent = response.data.response;
        
        if (user && currentConversationId) {
          try {
            const assistantMessage = await createMessage(currentConversationId, assistantContent, 'assistant');
            setMessages(prev => [...prev, assistantMessage]);
          } catch (error) {
            console.error('Error creating assistant message:', error);
            toast.error('Failed to save assistant message, but here is the response:');
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              conversation_id: currentConversationId,
              content: assistantContent,
              type: 'assistant',
              created_at: new Date().toISOString()
            }]);
          }
        } else {
          const assistantMessage = saveGuestMessage({ content: assistantContent, type: 'assistant' });
          setMessages(prev => [...prev, assistantMessage]);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file with question:', error);
      toast.error('An error occurred while processing your file');
      throw error;
    }
  };
  
  const handleUploadFile = async (file: File) => {
    try {
      setUploadedFile(file);
      toast.success(`File uploaded: ${file.name}. Please ask a question about it.`);
      
      const fileMessage = `[File uploaded: ${file.name}]`;
      
      if (user && currentConversationId) {
        const message = await createMessage(currentConversationId, fileMessage, 'user');
        setMessages(prev => [...prev, message]);
      } else {
        const message = saveGuestMessage({ content: fileMessage, type: 'user' });
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading your file');
    }
  };

  const handleVoiceInput = () => {
    // This is now handled within the AMAAChatBox component
    console.log('Voice input toggled from parent component');
  };

  const handleNewConversation = () => {
    if (messages.length > 0) {
      if (confirm('Start a new conversation? This will clear the current conversation.')) {
        setMessages([]);
        setCurrentConversationId(null);
        setUploadedFile(null);
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
    setUploadedFile(null);
    toast.success(`Loaded conversation: ${conversation.title}`);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await updateConversationTitle(id, newTitle);
      
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
      
      if (id === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
        setUploadedFile(null);
      }
      
      loadConversations();
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const displayMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.created_at
  })).reverse();

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
        onLogin={signOut}
      />
      
      <main className="container mx-auto px-4 pt-12 flex-grow">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {user ? (
              <UserMenu onLogout={signOut} isPremium={isPremium} />
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <LogIn size={16} />
                    <span>Log in</span>
                  </Button>
                </Link>
                <Link to="/subscribe">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-teal text-white hover:bg-teal-light flex items-center gap-2"
                  >
                    <CreditCard size={16} />
                    <span>Subscribe</span>
                  </Button>
                </Link>
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
                disabled={guestQueriesCount >= MAX_GUEST_QUERIES && !isPremium}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Info size={12} />
              <span>
                {user ? (
                  isPremium ? (
                    "You are a Premium user, using the unlimited capabilities of the app."
                  ) : (
                    <>
                      Free users have 5 queries. 
                      <Link to="/subscribe" className="text-teal hover:text-teal-light hover:underline mx-1">
                        Go Premium
                      </Link> 
                      for unlimited access and much more.
                    </>
                  )
                ) : (
                  <>
                    Free users have 5 queries. 
                    <Link to="/subscribe" className="text-teal hover:text-teal-light hover:underline mx-1">
                      Go Premium
                    </Link> 
                    for unlimited access and much more.
                  </>
                )}
              </span>
            </div>

            {user && (
              <ConversationControls 
                onNewConversation={handleNewConversation}
                onSaveConversation={handleSaveConversation}
                onLoadConversation={handleLoadConversation}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                savedConversations={savedConversations}
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
                {isLoading && (
                  <div ref={loadingIndicatorRef}>
                    <LoadingIndicator />
                  </div>
                )}
                
                {displayMessages.map((message, index) => (
                  <div key={message.id}>
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
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/terms" className="footer-link">Terms</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
            </div>
            <div className="copyright">
              © Copyright 2025 <Link to="/" className="text-teal mx-1.5 hover:text-teal-light transition-colors">AMAA.pro</Link>. Powered by AMAA <Heart size={12} className="text-teal ml-1.5 animate-pulse-gentle" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

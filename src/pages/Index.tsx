import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Info, Heart, LogIn, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import UserMenu from '../components/UserMenu';
import MainSearch from '../components/MainSearch';
import MessagesList from '../components/MessagesList';
import { useAuth } from '@/contexts/AuthContext';
import { useConversation } from '@/hooks/useConversation';
import { useMessageProcessor } from '@/hooks/useMessageProcessor';
import { 
  ExtendedMessage,
  getGuestMessages,
  getGuestQueryCount,
  GUEST_CONVERSATION_ID
} from '@/services/conversationService';

const MAX_GUEST_QUERIES = 10;

const Index = () => {
  const [mainSearchVisible, setMainSearchVisible] = useState(true);
  const [guestQueriesCount, setGuestQueriesCount] = useState(0);
  const [stickyHeader, setStickyHeader] = useState<{ visible: boolean; height: number }>({ visible: false, height: 0 });

  const { user, signOut, isPremium } = useAuth();
  const navigate = useNavigate();
  
  const mainSearchRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    messages,
    setMessages,
    currentConversationId,
    setCurrentConversationId,
    isLoading,
    setIsLoading,
    saveConversation,
    renameConversation,
    deleteConversation,
    addMessage,
    resetConversation
  } = useConversation(user?.id);

  const {
    uploadedFile,
    isVoiceActive,
    setIsVoiceActive,
    handleSendMessage,
    handleUploadFile
  } = useMessageProcessor({
    isPremium,
    guestQueriesCount,
    maxGuestQueries: MAX_GUEST_QUERIES,
    user,
    currentConversationId,
    addMessage,
    setIsLoading,
    setGuestQueriesCount
  });
  
  useEffect(() => {
    if (user) {
      document.body.setAttribute('data-user-logged-in', 'true');
      
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
    
    return () => {
      document.body.removeAttribute('data-user-logged-in');
    };
  }, [user, isPremium]);

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

  const handleNewConversation = () => {
    if (messages.length > 0) {
      if (confirm('Start a new conversation? This will clear the current conversation.')) {
        resetConversation();
        scrollToTop();
      }
    }
  };

  const handleTopicClick = (topic: string) => {
    handleSendMessage(topic, 'web-search');
  };

  const savedConversations = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    messages: [],
    savedAt: conv.created_at
  }));

  return (
    <div className="min-h-screen flex flex-col relative">
      
      <Header 
        mainSearchVisible={mainSearchVisible}
        onSendMessage={handleSendMessage}
        onScrollToTop={scrollToTop}
        isLoggedIn={!!user}
        onLogin={signOut}
        onStickyHeaderStateChange={setStickyHeader}
      />
      
      <main className="container mx-auto px-4 pt-12 flex-grow">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {user ? (
              <>
                <UserMenu onLogout={signOut} isPremium={isPremium} />
                {!isPremium && (
                  <Link to="/subscribe">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-teal text-white hover:bg-teal-light flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      <span>Premium</span>
                    </Button>
                  </Link>
                )}
              </>
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
          
          <div ref={mainSearchRef}>
            <MainSearch
              onSendMessage={handleSendMessage}
              onUploadFile={handleUploadFile}
              onVoiceInput={() => setIsVoiceActive(!isVoiceActive)}
              onNewConversation={handleNewConversation}
              onSaveConversation={saveConversation}
              onLoadConversation={(conv) => {
                setCurrentConversationId(conv.id);
                toast.success(`Loaded conversation: ${conv.title}`);
              }}
              onRenameConversation={renameConversation}
              onDeleteConversation={deleteConversation}
              savedConversations={savedConversations}
              currentMessages={messages}
              isDisabled={guestQueriesCount >= MAX_GUEST_QUERIES && !isPremium}
              isPremium={isPremium}
              isLoggedIn={!!user}
            />
          </div>
          
          {messages.length > 0 && (
            <MessagesList 
              messages={messages}
              isLoading={isLoading}
              onTopicClick={handleTopicClick}
            />
          )}
        </div>
      </main>
      
      <footer
        className="footer-container"
        style={{
          marginBottom: stickyHeader.visible ? `${stickyHeader.height}px` : undefined,
          transition: 'margin-bottom 300ms',
        }}
      >
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

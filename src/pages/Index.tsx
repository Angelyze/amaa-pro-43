
import React, { useEffect, useRef, useState } from 'react';
import AMAAChatBox from '../components/AMAAChatBox';
import Header from '../components/Header';
import Logo from '../components/Logo';
import Message from '../components/Message';
import LoadingIndicator from '../components/LoadingIndicator';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Info, Heart } from 'lucide-react';
import { toast } from 'sonner';

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
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Mock responses for demo purposes
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
    const isVisible = mainSearchRect.top >= 0 && mainSearchRect.bottom <= window.innerHeight;
    
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
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate API delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      // Add assistant response
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
    }, 2000);
  };
  
  const handleUploadFile = (file: File) => {
    toast.info(`Uploaded file: ${file.name}`);
    
    // Add user message about the file
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: `I've uploaded ${file.name} for analysis.`,
      type: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate processing
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

  return (
    <div className="min-h-screen pb-24">
      <Header 
        mainSearchVisible={mainSearchVisible}
        onSendMessage={handleSendMessage}
        onScrollToTop={scrollToTop}
      />
      
      <main className="container mx-auto px-4 pt-12">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
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
          </div>
          
          {messages.length > 0 && (
            <div className="max-w-3xl mx-auto mt-12 mb-8">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    content={message.content}
                    type={message.type}
                    timestamp={message.timestamp}
                  />
                ))}
                
                {isLoading && <LoadingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-6 mt-auto">
        <div className="flex justify-center items-center text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            Made with <Heart size={14} className="text-teal animate-pulse-gentle" /> by AMAA
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;

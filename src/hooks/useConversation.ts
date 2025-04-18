
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Conversation,
  ExtendedMessage,
  createConversation,
  createMessage,
  getConversations,
  getMessages,
  deleteConversation,
  updateConversationTitle,
  saveMessagesToConversation
} from '@/services/conversationService';

export function useConversation(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load conversations when user is available
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId && userId && !isSaving) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, userId, isSaving]);

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

  const saveConversation = async (customTitle?: string) => {
    if (!userId) {
      toast.error('Please log in to save conversations');
      return;
    }
    
    if (messages.length === 0) {
      toast.error('No conversation to save');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (currentConversationId && currentConversationId !== 'temp') {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (!conversation) {
          setIsSaving(false);
          return;
        }
        
        const title = customTitle || conversation.title;
        await updateConversationTitle(currentConversationId, title);
        
        await loadConversations();
        toast.success('Conversation updated successfully');
        setIsSaving(false);
        return;
      }
      
      const firstUserMessage = messages.find(m => m.type === 'user');
      const defaultTitle = firstUserMessage 
        ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') 
        : 'New Conversation';
      
      const title = customTitle || defaultTitle;
      
      const newConversation = await createConversation(title, userId);
      
      await saveMessagesToConversation(newConversation.id, messages);
      
      setCurrentConversationId(newConversation.id);
      
      const updatedMessages = messages.map(msg => ({
        ...msg,
        conversation_id: newConversation.id
      }));
      setMessages(updatedMessages);
      
      await loadConversations();
      
      toast.success('Conversation saved successfully');
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    try {
      await updateConversationTitle(id, newTitle);
      loadConversations();
      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const deleteCurrentConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      
      if (id === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      
      loadConversations();
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const addMessage = (newMessage: ExtendedMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const resetConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  return {
    conversations,
    messages,
    setMessages,
    currentConversationId,
    setCurrentConversationId,
    isLoading,
    setIsLoading,
    isSaving,
    loadConversations,
    loadMessages,
    saveConversation,
    renameConversation,
    deleteConversation: deleteCurrentConversation,
    addMessage,
    resetConversation
  };
}

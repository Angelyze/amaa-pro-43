
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  type: 'user' | 'assistant';
  created_at: string;
}

// Guest session management
const GUEST_STORAGE_KEY = 'amaa_guest_messages';
const GUEST_COUNTER_KEY = 'amaa_guest_query_count';
export const GUEST_CONVERSATION_ID = 'guest-session';

export const getGuestQueryCount = (): number => {
  return parseInt(localStorage.getItem(GUEST_COUNTER_KEY) || '0', 10);
};

export const incrementGuestQueryCount = (): number => {
  const currentCount = getGuestQueryCount();
  const newCount = currentCount + 1;
  localStorage.setItem(GUEST_COUNTER_KEY, newCount.toString());
  return newCount;
};

export const getGuestMessages = (): Message[] => {
  const storedMessages = localStorage.getItem(GUEST_STORAGE_KEY);
  return storedMessages ? JSON.parse(storedMessages) : [];
};

export const saveGuestMessage = (message: Omit<Message, 'id' | 'conversation_id' | 'created_at'>): Message => {
  const messages = getGuestMessages();
  const newMessage: Message = {
    id: crypto.randomUUID(),
    conversation_id: GUEST_CONVERSATION_ID,
    content: message.content,
    type: message.type,
    created_at: new Date().toISOString()
  };
  
  const updatedMessages = [...messages, newMessage];
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedMessages));
  return newMessage;
};

export const clearGuestMessages = (): void => {
  localStorage.removeItem(GUEST_STORAGE_KEY);
  localStorage.removeItem(GUEST_COUNTER_KEY); // Also clear the query count when messages are cleared
};

// Conversation-related functions
export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return data || [];
};

export const createConversation = async (title: string): Promise<Conversation> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to create a conversation');
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ 
      title, 
      user_id: user.id 
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
};

export const deleteConversation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const updateConversationTitle = async (id: string, title: string): Promise<void> => {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
};

// Message-related functions
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data as Message[] || [];
};

export const createMessage = async (conversationId: string, content: string, type: 'user' | 'assistant'): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, content, type })
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  return data as Message;
};

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
  file_data?: {
    type: string;
    name: string;
    data: string;
  } | null;
}

export interface ExtendedMessage extends Message {
  fileData?: {
    type: string;
    name: string;
    data: string;
  };
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

export const getGuestMessages = (): ExtendedMessage[] => {
  const storedMessages = localStorage.getItem(GUEST_STORAGE_KEY);
  return storedMessages ? JSON.parse(storedMessages) : [];
};

export const saveGuestMessage = (message: Omit<Message, 'id' | 'conversation_id' | 'created_at'> & { 
  fileData?: { type: string; name: string; data: string; } 
}): ExtendedMessage => {
  const messages = getGuestMessages();
  const newMessage: ExtendedMessage = {
    id: crypto.randomUUID(),
    conversation_id: GUEST_CONVERSATION_ID,
    content: message.content,
    type: message.type,
    created_at: new Date().toISOString(),
    fileData: message.fileData
  };
  
  const updatedMessages = [...messages, newMessage];
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedMessages));
  return newMessage;
};

export const clearGuestMessages = (): void => {
  localStorage.removeItem(GUEST_STORAGE_KEY);
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
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  if (!user) {
    throw new Error('User must be logged in to create a conversation');
  }

  console.log('Creating conversation with user_id:', user.id);
  
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
export const getMessages = async (conversationId: string): Promise<ExtendedMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  // Transform data to include fileData from file_data for compatibility
  return (data || []).map(message => ({
    ...message,
    fileData: message.file_data
  })) as ExtendedMessage[];
};

export const createMessage = async (conversationId: string, content: string, type: 'user' | 'assistant', fileData?: { type: string; name: string; data: string }): Promise<ExtendedMessage> => {
  console.log(`Creating ${type} message for conversation ${conversationId}`);
  
  const messageData: any = { 
    conversation_id: conversationId, 
    content, 
    type 
  };
  
  if (fileData) {
    messageData.file_data = fileData;
  }
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  // Return with fileData from file_data for consistency
  return {
    ...data,
    fileData: data.file_data
  } as ExtendedMessage;
};

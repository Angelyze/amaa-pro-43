
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ExtendedMessage,
  createMessage,
  saveGuestMessage,
  incrementGuestQueryCount
} from '@/services/conversationService';
import { useFileUpload, FileData } from './useFileUpload';
import { useSubscriptionCheck } from './useSubscriptionCheck';
import { processFileWithQuestion, sendMessageToAI } from '@/services/messageProcessorService';

interface ProcessorOptions {
  isPremium: boolean;
  guestQueriesCount: number;
  maxGuestQueries: number;
  user: any;
  currentConversationId: string | null;
  addMessage: (message: ExtendedMessage) => void;
  setIsLoading: (loading: boolean) => void;
  setGuestQueriesCount: (count: number) => void;
}

export function useMessageProcessor(options: ProcessorOptions) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const { 
    isPremium, 
    guestQueriesCount, 
    maxGuestQueries, 
    user, 
    currentConversationId, 
    addMessage, 
    setIsLoading,
    setGuestQueriesCount
  } = options;

  const {
    uploadedFile,
    uploadedFileData,
    isImageFile,
    handleUploadFile,
    resetFileUpload
  } = useFileUpload();

  const {
    checkUserQueryLimit,
    incrementQueryCount
  } = useSubscriptionCheck({
    isPremium,
    guestQueriesCount,
    maxGuestQueries,
    setGuestQueriesCount
  });

  const handleSendMessage = async (content: string, type: 'regular' | 'web-search' | 'research' | 'code') => {
    try {
      // Check if user has reached their query limit
      if (!checkUserQueryLimit()) {
        return;
      }
      
      let messageContent = content;
      let finalFileData = uploadedFileData;
      
      // Handle user message (create and display it)
      if (user) {
        let userMessage: ExtendedMessage;
        
        if (currentConversationId) {
          userMessage = await createMessage(
            currentConversationId, 
            messageContent, 
            'user',
            finalFileData
          );
        } else {
          userMessage = {
            id: crypto.randomUUID(),
            conversation_id: 'temp',
            content: messageContent,
            type: 'user',
            created_at: new Date().toISOString(),
            fileData: finalFileData
          };
        }
        
        addMessage(userMessage);
        setIsLoading(true);
        
        // Increment query count for non-premium users
        incrementQueryCount();
      } else {
        // Handle guest user
        incrementQueryCount();
        
        const userMessage = saveGuestMessage({ 
          content: messageContent, 
          type: 'user',
          fileData: finalFileData
        });
        
        addMessage(userMessage);
        setIsLoading(true);
      }
      
      // Process message with AI service
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      // If there's a file upload, process it with the file handler
      if (uploadedFile && type !== 'web-search' && type !== 'research' && type !== 'code') {
        await processFileWithQuestion({
          question: content,
          file: uploadedFile,
          fileData: uploadedFileData as FileData,
          user,
          currentConversationId,
          addMessage,
          isImageFile,
          createMessage,
          saveGuestMessage
        });
      } else {
        // Handle regular message
        const assistantContent = await sendMessageToAI({
          content,
          type,
          fileData: uploadedFileData, // Fix: Explicitly providing uploadedFileData instead of using shorthand
          session
        });
        
        if (user) {
          let assistantMessage: ExtendedMessage;
          
          if (currentConversationId) {
            try {
              console.log('Creating message for user with conversation_id:', currentConversationId);
              assistantMessage = await createMessage(currentConversationId, assistantContent, 'assistant');
            } catch (error) {
              console.error('Error creating assistant message:', error);
              toast.error('Failed to save assistant message, but here is the response:');
              assistantMessage = {
                id: crypto.randomUUID(),
                conversation_id: currentConversationId,
                content: assistantContent,
                type: 'assistant',
                created_at: new Date().toISOString()
              };
            }
          } else {
            assistantMessage = {
              id: crypto.randomUUID(),
              conversation_id: 'temp',
              content: assistantContent,
              type: 'assistant',
              created_at: new Date().toISOString()
            };
          }
          
          addMessage(assistantMessage);
        } else {
          const assistantMessage = saveGuestMessage({ content: assistantContent, type: 'assistant' });
          addMessage(assistantMessage);
        }
      }
      
      // Reset state
      resetFileUpload();
      setIsVoiceActive(false);
      
    } catch (error) {
      console.error('Error in conversation:', error);
      toast.error('An error occurred while processing your request');
      setIsVoiceActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadedFile,
    uploadedFileData,
    isVoiceActive,
    setIsVoiceActive,
    handleSendMessage,
    handleUploadFile
  };
}

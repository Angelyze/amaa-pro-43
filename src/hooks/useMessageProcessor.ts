
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ExtendedMessage,
  createMessage,
  saveGuestMessage,
  incrementGuestQueryCount
} from '@/services/conversationService';

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<{
    type: string;
    name: string;
    data: string;
  } | null>(null);
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

  const isImageFile = (fileType: string): boolean => {
    return fileType.startsWith('image/');
  };

  const handleSendMessage = async (content: string, type: 'regular' | 'web-search' | 'research') => {
    try {
      const userHasReachedLimit = !isPremium && guestQueriesCount >= maxGuestQueries;
      
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
      
      let messageContent = content;
      let finalFileData = uploadedFileData;
      
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
        
        if (!isPremium) {
          const newCount = incrementGuestQueryCount();
          setGuestQueriesCount(newCount);
          
          if (newCount === maxGuestQueries) {
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
        
        if (newCount === maxGuestQueries) {
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
        
        const userMessage = saveGuestMessage({ 
          content: messageContent, 
          type: 'user',
          fileData: finalFileData
        });
        
        addMessage(userMessage);
        setIsLoading(true);
      }
      
      if (uploadedFile && type !== 'web-search' && type !== 'research') {
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
        
        setUploadedFile(null);
        setUploadedFileData(null);
        
        setIsVoiceActive(false);
      }
    } catch (error) {
      console.error('Error in conversation:', error);
      toast.error('An error occurred while processing your request');
      setIsVoiceActive(false);
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
        const fileResponse = {
          type: file.type,
          name: file.name,
          data: fileData as string
        };
        
        if (user) {
          let assistantMessage: ExtendedMessage;
          
          if (currentConversationId) {
            try {
              assistantMessage = await createMessage(
                currentConversationId, 
                assistantContent, 
                'assistant',
                isImageFile(file.type) ? fileResponse : undefined
              );
            } catch (error) {
              console.error('Error creating assistant message:', error);
              toast.error('Failed to save assistant message, but here is the response:');
              assistantMessage = {
                id: crypto.randomUUID(),
                conversation_id: currentConversationId,
                content: assistantContent,
                type: 'assistant',
                created_at: new Date().toISOString(),
                fileData: isImageFile(file.type) ? fileResponse : undefined
              };
            }
          } else {
            assistantMessage = {
              id: crypto.randomUUID(),
              conversation_id: 'temp',
              content: assistantContent,
              type: 'assistant',
              created_at: new Date().toISOString(),
              fileData: isImageFile(file.type) ? fileResponse : undefined
            };
          }
          
          addMessage(assistantMessage);
        } else {
          const assistantMessage = saveGuestMessage({ 
            content: assistantContent, 
            type: 'assistant',
            fileData: isImageFile(file.type) ? fileResponse : undefined
          });
          
          addMessage(assistantMessage);
        }
        
        setUploadedFile(null);
        setUploadedFileData(null);
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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        setUploadedFileData({
          type: file.type,
          name: file.name,
          data: fileData
        });
      };
      reader.readAsDataURL(file);
      
      toast.success(`File uploaded: ${file.name}. Please ask a question about it.`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading your file');
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

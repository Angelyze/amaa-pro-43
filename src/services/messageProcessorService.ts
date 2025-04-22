
import { supabase } from '@/integrations/supabase/client';
import { ExtendedMessage } from './conversationService';
import { FileData } from '@/hooks/useFileUpload';
import { processFileWithAI } from './aiProviders/fileProcessingService';
import { sendGeminiRequest } from './aiProviders/geminiService';
import { sendWebSearchRequest } from './aiProviders/perplexityService';
import { sendResearchRequest, sendCodingRequest } from './aiProviders/xaiService';

interface ProcessFileOptions {
  question: string;
  file: File;
  fileData: FileData;
  user: any;
  currentConversationId: string | null;
  addMessage: (message: ExtendedMessage) => void;
  isImageFile: (fileType: string) => boolean;
  createMessage: (conversationId: string, content: string, type: string, fileData?: FileData) => Promise<ExtendedMessage>;
  saveGuestMessage: (message: { content: string; type: string; fileData?: FileData }) => ExtendedMessage;
}

interface SendMessageOptions {
  content: string;
  type: 'regular' | 'web-search' | 'research' | 'code';
  fileData: FileData | null;
  session: any;
}

export const processFileWithQuestion = async (options: ProcessFileOptions) => {
  const { question, file, fileData, user, currentConversationId, addMessage, isImageFile, createMessage, saveGuestMessage } = options;

  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    const filePayload = {
      name: file.name,
      type: file.type,
      data: fileData.data
    };
    
    const assistantContent = await processFileWithAI(filePayload, question, session);
    
    if (user) {
      let assistantMessage: ExtendedMessage;
      
      if (currentConversationId) {
        try {
          assistantMessage = await createMessage(
            currentConversationId, 
            assistantContent, 
            'assistant',
            isImageFile(file.type) ? fileData : undefined
          );
        } catch (error) {
          console.error('Error creating assistant message:', error);
          throw error;
        }
      } else {
        assistantMessage = {
          id: crypto.randomUUID(),
          conversation_id: 'temp',
          content: assistantContent,
          type: 'assistant',
          created_at: new Date().toISOString(),
          fileData: isImageFile(file.type) ? fileData : undefined
        };
      }
      
      addMessage(assistantMessage);
    } else {
      const assistantMessage = saveGuestMessage({ 
        content: assistantContent, 
        type: 'assistant',
        fileData: isImageFile(file.type) ? fileData : undefined
      });
      
      addMessage(assistantMessage);
    }
    
    return true;
  } catch (error) {
    console.error('Error processing file with question:', error);
    throw error;
  }
};

export const sendMessageToAI = async (options: SendMessageOptions) => {
  const { content, type, session } = options;
  
  try {
    console.log(`Sending message to AI service with type: ${type}`);
    let response;
    
    switch (type) {
      case 'web-search':
        response = await sendWebSearchRequest(content, session);
        break;
      case 'research':
        response = await sendResearchRequest(content, session);
        break;
      case 'code':
        response = await sendCodingRequest(content, session);
        break;
      case 'regular':
      default:
        response = await sendGeminiRequest(content, session);
    }
    
    return response;
  } catch (error) {
    console.error('Error in sendMessageToAI:', error);
    throw error;
  }
};

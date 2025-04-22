
import { supabase } from '@/integrations/supabase/client';
import { FileData } from '@/hooks/useFileUpload';

export const processFileWithAI = async (
  file: {
    name: string;
    type: string;
    data: string;
  },
  question: string,
  session: any
) => {
  try {
    console.log('Processing file with AI service');
    
    const response = await supabase.functions.invoke('ai-service', {
      body: { 
        message: question,
        type: 'upload',
        file,
        photoContext: question
      },
      headers: session ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    });
    
    if (response.error) {
      console.error('Error from file processing service:', response.error);
      throw new Error(response.error.message);
    }
    
    return response.data.response;
  } catch (error) {
    console.error('Error in file processing service:', error);
    throw error;
  }
};

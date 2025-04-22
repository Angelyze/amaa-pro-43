
import { supabase } from '@/integrations/supabase/client';

const formatGeminiRequest = (message: string) => {
  const formattingInstructions = `You are a helpful AI assistant that provides accurate, relevant, and engaging responses. Format your responses using proper Markdown:
- Use headings (## or ###) to organize information
- Format code with backticks
- Use bullet points for lists
- Include source links when referencing external information
- Structure with clear paragraphs

Please respond to this request: `;
  
  return formattingInstructions + message;
};

export const sendGeminiRequest = async (message: string, session: any) => {
  try {
    console.log('Sending request to Gemini AI');
    
    const response = await supabase.functions.invoke('ai-service', {
      body: { 
        message,
        type: 'regular'
      },
      headers: session ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    });
    
    if (response.error) {
      console.error('Error from Gemini service:', response.error);
      throw new Error(response.error.message);
    }
    
    return response.data.response;
  } catch (error) {
    console.error('Error in Gemini service:', error);
    throw error;
  }
};

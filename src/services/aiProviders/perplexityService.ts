
import { supabase } from '@/integrations/supabase/client';

// Reworded system message for detail, depth, and as much info as possible.
export const sendWebSearchRequest = async (query: string, session: any) => {
  try {
    console.log('Sending web search query to Perplexity');

    const response = await supabase.functions.invoke('ai-service', {
      body: { 
        message: query,
        type: 'web-search',
        // Add detailed instructions for the assistant for the best possible answer:
        morePrompt: "Please provide a highly detailed, comprehensive, and well-organized answer. Include as much relevant information, context, facts, and useful examples as possible. Do not summarize briefly—expand fully, present depth, cite up-to-date details, and anticipate any follow-up questions." 
      },
      headers: session ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    });
    
    if (response.error) {
      console.error('Error from Perplexity service:', response.error);
      throw new Error(response.error.message);
    }
    
    return response.data.response;
  } catch (error) {
    console.error('Error in Perplexity service:', error);
    throw error;
  }
};

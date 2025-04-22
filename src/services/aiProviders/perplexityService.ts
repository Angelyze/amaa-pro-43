
import { supabase } from '@/integrations/supabase/client';

export const sendWebSearchRequest = async (query: string, session: any) => {
  try {
    console.log('Sending web search query to Perplexity');
    
    const response = await supabase.functions.invoke('ai-service', {
      body: { 
        message: query,
        type: 'web-search'
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

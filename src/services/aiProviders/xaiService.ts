
import { supabase } from '@/integrations/supabase/client';

export const sendResearchRequest = async (query: string, session: any) => {
  try {
    console.log('Sending research query to XAI service');
    
    const response = await supabase.functions.invoke('ai-service', {
      body: { 
        message: query,
        type: 'research'
      },
      headers: session ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    });
    
    if (response.error) {
      console.error('Error from XAI research service:', response.error);
      throw new Error(response.error.message);
    }
    
    return response.data.response;
  } catch (error) {
    console.error('Error in XAI research service:', error);
    throw error;
  }
};

export const sendCodingRequest = async (query: string, session: any) => {
  try {
    console.log('Sending coding query to XAI service');
    
    const response = await supabase.functions.invoke('ai-service', {
      body: { 
        message: query,
        type: 'code'
      },
      headers: session ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    });
    
    if (response.error) {
      console.error('Error from XAI coding service:', response.error);
      throw new Error(response.error.message);
    }
    
    return response.data.response;
  } catch (error) {
    console.error('Error in XAI coding service:', error);
    throw error;
  }
};

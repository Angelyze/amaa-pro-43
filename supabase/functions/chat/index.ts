
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Log headers for debugging
    console.log('Request headers in chat function:', Object.fromEntries(req.headers.entries()));
    
    const reqBody = await req.json();
    
    // Redirect to our new ai-service function
    const aiServiceUrl = new URL('/functions/v1/ai-service', req.url);
    
    // Forward ALL headers, especially authorization
    const response = await fetch(aiServiceUrl.toString(), {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(reqBody),
    });
    
    const responseData = await response.json();
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request: ' + error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

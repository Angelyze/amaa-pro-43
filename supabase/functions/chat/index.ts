
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
    
    // Ensure authorization header is properly forwarded
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Forward all headers, especially authorization
    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      headers.set(key, value);
    }
    
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(aiServiceUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(reqBody),
    });
    
    if (!response.ok) {
      console.error('Error from ai-service:', response.status, response.statusText);
      throw new Error(`AI service returned error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        response: "I'm sorry, there was an error processing your request. Please try again.",
        error: 'An error occurred processing your request: ' + error.message,
        model: "system-message"
      }),
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

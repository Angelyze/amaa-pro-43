
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_RESPONSES = [
  "I'm AMAA, your AI assistant. I can help you find information, answer questions, and even search the web for the latest content. What would you like to know?",
  "The concept of minimalism in design emerged in the late 1960s as a reaction against the subjective expressionism of abstract expressionism. It emphasizes simplicity and objectivity, using clean lines, geometric shapes, and a monochromatic palette.",
  "According to recent studies, regular meditation can reduce stress, improve focus, and promote overall well-being. Even just 10 minutes of daily meditation has been shown to make a significant difference in cognitive function and emotional regulation.",
  "The James Webb Space Telescope, launched in December 2021, is the largest, most powerful space telescope ever built. It allows astronomers to observe the universe in unprecedented detail, including the formation of early galaxies and potential habitable exoplanets."
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { message, conversationType } = await req.json();
    
    console.log('Received request:', { message, conversationType });
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get a random response or process based on type
    const responseIndex = Math.floor(Math.random() * AI_RESPONSES.length);
    let aiResponse;
    
    if (conversationType === 'web-search') {
      aiResponse = `Web search results for "${message}":\n\n${AI_RESPONSES[responseIndex]}`;
    } else {
      aiResponse = AI_RESPONSES[responseIndex];
    }
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        processing_time: "1.2 seconds"
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
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

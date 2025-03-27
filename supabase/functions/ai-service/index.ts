
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get API keys from environment variables
const GEMINI_API_KEYS = [
  Deno.env.get('GEMINI_API_KEY_1') || '',
  Deno.env.get('GEMINI_API_KEY_2') || '',
  Deno.env.get('GEMINI_API_KEY_3') || '',
];
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY') || '';

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
    // Log full request info for debugging
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    const { message, type, file, photoContext } = await req.json();
    console.log('Received request:', { 
      message, 
      type, 
      file: file ? 'File present' : 'No file',
      photoContext: photoContext ? 'Photo context present' : 'No photo context' 
    });
    
    // Choose appropriate API based on the type
    if (type === 'web-search') {
      return await handlePerplexitySearch(message);
    } else if (type === 'upload' && file) {
      // Only process the file if we have context from the user
      if (photoContext) {
        return await handleGeminiFileAnalysis(photoContext, file);
      } else {
        // Just acknowledge that we received the file but don't process it yet
        return new Response(
          JSON.stringify({ 
            response: "I've received your file. What would you like to know about it?",
            model: "system-message"
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }
    } else {
      return await handleGeminiRegularChat(message);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
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

async function handleGeminiRegularChat(message: string) {
  // Try each API key until one works
  let lastError = null;
  
  for (const apiKey of GEMINI_API_KEYS) {
    if (!apiKey) continue;
    
    try {
      console.log('Trying Gemini API with key length:', apiKey.length);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `${message}
                
                FORMATTING INSTRUCTIONS:
                - Use proper Markdown formatting in your response
                - For links, use the full Markdown syntax: [link text](https://example.com)
                - Use headings (##, ###) to organize information
                - Use bullet points (*) or numbered lists (1.) where appropriate
                - Format code snippets with backticks or code blocks
                - Use bold and italic formatting when it enhances readability
                - Include source links when referencing external information
                - Structure information with clear sections and paragraphs`
              }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      });
      
      const data = await response.json();
      console.log('Gemini API response status:', response.status);
      
      if (data.error) {
        console.error('Gemini API returned error:', data.error);
        throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      // Extract the response text
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      
      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          model: "gemini-2.0-flash"
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    } catch (error) {
      console.error(`Error with Gemini API key: ${error.message}`);
      lastError = error;
      // Continue to the next API key
    }
  }
  
  // If we get here, all API keys failed
  return new Response(
    JSON.stringify({ error: `All Gemini API keys failed. Last error: ${lastError?.message}` }),
    { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      } 
    }
  );
}

async function handleGeminiFileAnalysis(message: string, file: any) {
  // Process file analysis only when we have context from the user
  const apiKey = GEMINI_API_KEYS.find(key => key) || '';
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'No Gemini API keys available' }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
  
  try {
    console.log('Processing file analysis with context:', message);
    // Handle file analysis request
    let fileData = file.data;
    let imageData;
    
    // If the file data is in base64 format, use it directly
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      imageData = fileData;
    } else {
      // Convert to base64 if needed
      imageData = `data:${file.type};base64,${fileData}`;
    }
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: message },
            { 
              inline_data: {
                mime_type: file.type,
                data: fileData.replace(/^data:image\/\w+;base64,/, '')
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    };
    
    console.log('Sending payload to Gemini with image data');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini file analysis returned error:', data.error);
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't analyze the file.";
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: "gemini-2.0-flash"
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error(`Error in file analysis: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `File analysis failed: ${error.message}` }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
}

async function handlePerplexitySearch(message: string) {
  if (!PERPLEXITY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Perplexity API key not configured' }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
  
  try {
    console.log('Sending search query to Perplexity API:', message);
    
    // Enhanced system prompt for Perplexity to maximize SONAR model capabilities
    const systemPrompt = `You are an up-to-date web search assistant providing the most current information available. 
    Follow these guidelines when responding:
    
    1. ALWAYS respond in the SAME LANGUAGE as the user's query
    2. Start with a direct summary answering the query in 2-3 sentences
    3. Include SPECIFIC DATES for all information mentioned
    4. Format with proper Markdown:
       - Use ## for main sections and ### for subsections
       - Use bullet points (*) for lists
       - Format code with proper \`\`\` code blocks
       - Use **bold** for emphasis
       - Use > for quotations
    5. For factual information, cite sources inline with [Source Name](URL)
    6. IMPORTANT: Include images by adding IMAGE_URL: [url] lines (exactly this format)
    7. End with a "## Recent Articles" section containing 5 recent, relevant sources with:
       - Title as clickable link [Title](URL)
       - One sentence description
       - Publication date (YYYY-MM-DD)
       - Source name
       - Include IMAGE_URL: [url] line for each article's image if available
    8. All URLs must be fully functional, properly escaped markdown links
    9. Prioritize content from the last 30 days
    10. If information is time-sensitive, note when the search was conducted`;
    
    // Use SONAR model with optimal parameters
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.95,
        frequency_penalty: 1,
        presence_penalty: 0,
        search_domain_filter: [],
        search_recency_filter: 'month'
      }),
    });
    
    const data = await response.json();
    console.log('Perplexity API response status:', response.status);
    
    if (data.error) {
      console.error('Perplexity returned error:', data.error);
      throw new Error(`Perplexity API error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    let searchResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't perform the search.";
    
    // Process the searchResponse to extract image URLs and prepare them for display
    searchResponse = await processSearchResponseForDisplay(searchResponse);
    
    return new Response(
      JSON.stringify({ 
        response: searchResponse,
        model: "llama-3.1-sonar-small-128k"
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error(`Error in Perplexity search: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Search failed: ${error.message}` }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
}

// Helper function to process the search response for display
async function processSearchResponseForDisplay(text: string): Promise<string> {
  // Remove any duplicate "Recent Articles" sections
  const sections = text.split(/(?=## Recent Articles)/);
  if (sections.length > 1) {
    // Keep only the last "Recent Articles" section
    text = sections[0] + sections[sections.length - 1];
  }
  
  // Extract and process all image URLs
  const imageRegex = /IMAGE_URL:\s*(\S+)/g;
  let match;
  let processedText = text;
  
  // Replace the IMAGE_URL references with markdown images
  const imageUrls: string[] = [];
  while ((match = imageRegex.exec(text)) !== null) {
    const [fullMatch, imageUrl] = match;
    
    // If URL is valid, replace the IMAGE_URL line with markdown image syntax
    if (imageUrl && imageUrl.startsWith('http')) {
      // Add to our collection of image URLs
      imageUrls.push(imageUrl);
      
      // Replace with markdown image syntax
      processedText = processedText.replace(
        fullMatch, 
        `![Search result image](${imageUrl})`
      );
    } else {
      // Remove invalid image references
      processedText = processedText.replace(fullMatch, '');
    }
  }
  
  // Fix broken links by ensuring URLs are properly formatted
  processedText = processedText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, linkText, url) => {
      // Check if URL is properly formatted
      if (!url.startsWith('http')) {
        // Try to fix the URL
        if (url.startsWith('www.')) {
          return `[${linkText}](https://${url})`;
        } else {
          // If we can't fix it, keep as is
          return match;
        }
      }
      return match;
    }
  );
  
  // Fix domain names that are split across multiple lines
  processedText = processedText.replace(
    /\(\s*([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9-]*)*)?\s*\)/g,
    (match, domain) => {
      if (domain) {
        return `(${domain.trim()})`;
      }
      return match;
    }
  );
  
  // Ensure the "Recent Articles" section has proper formatting
  processedText = processedText.replace(
    /## Recent Articles/g,
    '## Recent Articles'
  );

  // Make sure we have good line breaks after images
  processedText = processedText.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/g, 
    match => match + '\n\n'
  );
  
  console.log(`Processed ${imageUrls.length} image URLs for display`);
  return processedText;
}

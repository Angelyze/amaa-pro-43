
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get API keys from environment variables
const GEMINI_API_KEYS = [
  Deno.env.get('GEMINI_API_KEY_1') || '',
  Deno.env.get('GEMINI_API_KEY_2') || '',
  Deno.env.get('GEMINI_API_KEY_3') || '',
];
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';

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
      return await handleOpenRouterSearch(message);
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

async function handleOpenRouterSearch(message: string) {
  if (!OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenRouter API key not configured' }),
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
    // Detect language of user query for proper response formatting
    const userLanguage = 'auto'; // We'll let the model auto-detect language
    
    // Enhanced search query for up-to-date information with sources
    const searchQuery = `
      I need the MOST CURRENT AND UP-TO-DATE information about: ${message}
      
      CRITICAL INSTRUCTIONS:
      1. ONLY use information from 2025 (or the most recent available if we're in an earlier year)
      2. Start with a clear summary stating when the information was last updated
      3. Include SPECIFIC DATES for every piece of information
      4. If searching for API documentation or technical information, fetch the ABSOLUTE LATEST version 
      5. Explicitly note if any information seems outdated
      6. Format your response with clear Markdown formatting:
         - Use proper headings (## and ###)
         - Use bullet points or numbered lists where appropriate
         - Include FULL, clickable URLs using [text](URL) syntax
         - Format code with code blocks using backticks
      7. PRIORITIZE information from the last 30 days, especially for technical documentation
      8. For API documentation like "https://openrouter.ai/api/v1", ensure you're showing the latest endpoints and parameters
      9. Add a timestamp of when this search was conducted
      10. Include the date when each source was published/updated
      11. IMPORTANT: Format source links properly like "[text](URL)" or "(domain.com)" - NEVER split domain names across multiple lines!
      12. CRITICALLY IMPORTANT: RESPOND IN THE SAME LANGUAGE AS THE USER'S QUERY. Analyze "${message}" and respond in that same language.
      13. At the end of your response, include a section titled "## Recent Articles" with a list of the 5 most recent and relevant articles on this topic.
          Format EXACTLY as follows for each article:
          - Title as a link: [Full Article Title](URL)
          - Add image URL if available: IMAGE_URL: https://example.com/image.jpg
          - Short description: One paragraph (1-2 sentences) summarizing the article
          - Date: YYYY-MM-DD
          - Source: Domain name as plain text
      14. Format all links and domain names WITHOUT line breaks. Never split a URL or domain name across multiple lines.
      15. Don't include any custom class markers in your markdown.
      
      IMPORTANT: Do not include any special class markers like {.class-name} in your response. Just use plain markdown.
    `;
    
    console.log('Sending real-time web search query to OpenRouter:', searchQuery);
    
    // Using fetch with strict no-cache headers to ensure fresh data
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://amaa.pro',
        'X-Title': 'AMAA Pro',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-search-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are a real-time web search assistant specialized in finding the absolute most current information available right now. You MUST prioritize recency over all other considerations. You MUST respond in the SAME LANGUAGE as the user query. If the query is in Spanish, your entire response must be in Spanish. If in French, respond in French, etc. Always include full publication dates with any information. Format source links properly without line breaks or spaces. Never split domain names across lines. At the end, include a "## Recent Articles" section with 5 recent articles formatted with title links, images, descriptions, dates and sources.' 
          },
          { role: 'user', content: searchQuery }
        ],
        temperature: 0.2, // Lower temperature for more factual responses
        max_tokens: 1500,
      }),
    });
    
    const data = await response.json();
    console.log('OpenRouter response status:', response.status);
    
    if (data.error) {
      console.error('OpenRouter returned error:', data.error);
      throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    let searchResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't perform the search.";
    
    // Process the searchResponse to extract image URLs and prepare them for display
    const processedResponse = await processSearchResponseForImages(searchResponse);
    
    return new Response(
      JSON.stringify({ 
        response: processedResponse,
        model: "gpt-4o-search-preview"
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
    console.error(`Error in OpenRouter search: ${error.message}`);
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

// Helper function to process the search response and prepare image data
async function processSearchResponseForImages(text: string): Promise<string> {
  // Extract image URLs from the format "IMAGE_URL: [url]"
  const imageRegex = /IMAGE_URL:\s*(\S+)/g;
  let match;
  let processedText = text;
  
  // Replace the IMAGE_URL references with markdown images that our frontend will interpret
  const imageUrls: string[] = [];
  while ((match = imageRegex.exec(text)) !== null) {
    const [fullMatch, imageUrl] = match;
    
    // If URL is valid, replace the IMAGE_URL line with our custom image markdown
    if (imageUrl && imageUrl.startsWith('http')) {
      // Add to our collection of image URLs
      imageUrls.push(imageUrl);
      
      // Replace with markdown image syntax - adding search-result-image class
      processedText = processedText.replace(
        fullMatch, 
        `![Search result image](${imageUrl}){: .search-result-image}`
      );
    } else {
      // Remove invalid image references
      processedText = processedText.replace(fullMatch, '');
    }
  }
  
  // Replace the Recent Articles section marker without class information
  processedText = processedText.replace(
    /## Recent Articles\s*\{\.\w+\}/g, 
    '## Recent Articles'
  );
  
  // Also replace any other remaining class markers
  processedText = processedText.replace(/\{\.[\w-]+\}/g, '');
  
  // Fix any domain names that are split across multiple lines
  // This regex matches any opening parenthesis followed by potential domain name
  processedText = processedText.replace(
    /\(\s*([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9-]*)*)\s*\)/g,
    (match, domain) => {
      if (domain) {
        return `(${domain.trim()})`;
      }
      return match;
    }
  );
  
  // Fix formatting of source links that might get split across lines
  processedText = processedText.replace(
    /Source:\s*([^\n\r]+)(?:\r?\n)+\s*\(([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9-]*)*)\)/g,
    'Source: [$1]($2)'
  );
  
  // Fix other possible formatting issues with markdown links
  processedText = processedText.replace(
    /\[([^\]]+)\]\s*\(([^)]+)\)/g,
    '[$1]($2)'
  );
  
  console.log(`Processed ${imageUrls.length} image URLs for display`);
  return processedText;
}

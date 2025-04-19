
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
    
    // Modified system prompt with explicit instructions for proper link formatting
    const systemPrompt = `You are an up-to-date web search assistant providing the most current information available. 
    ALWAYS respond in the SAME LANGUAGE as the user's query.
    
    Follow these guidelines when responding:
    
    1. Start with a direct summary answering the query in 2-3 sentences
    2. Include SPECIFIC DATES for all information mentioned
    3. Format with proper Markdown:
       - Use ## for main sections and ### for subsections
       - Use bullet points (*) for lists
       - Format code with proper \`\`\` code blocks
       - Use **bold** for emphasis
       - Use > for quotations
    4. CRITICALLY IMPORTANT: ALL links MUST be properly formatted as [Title](https://example.com) and ALL articles must have clickable titles
    5. For images, use the exact syntax: ![Description](IMAGE_URL)
    6. End with a "## Recent Articles" section containing 5 recent, relevant sources formatted EXACTLY like this:
       - [EXACT ARTICLE TITLE](https://example.com)
       - One sentence description 
       - Date (YYYY-MM-DD)
       - Source name
       - Include an image for each article if available: ![Article image](IMAGE_URL)
    7. After Recent Articles, add a "## Related Topics" section with 3-5 related search topics as plain text:
       * First related topic
       * Second related topic 
       * Third related topic
    8. ALL URLs must be fully functional, direct links with complete http:// or https:// prefixes
    9. Prioritize content from the last 30 days
    10. DO NOT use SOURCE: prefixes before links
    11. NEVER put asterisks around related topics
    12. ENSURE EVERY ARTICLE HAS A DIRECT CLICKABLE LINK - this is critical`;
    
    // Use SONAR model with optimal parameters for web search with images
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
    
    // Clean up any formatting issues in the response
    searchResponse = cleanUpSearchResponse(searchResponse);
    
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

// Helper function to clean up the search response format
function cleanUpSearchResponse(text: string): string {
  // Remove any duplicate "Recent Articles" sections
  const sections = text.split(/(?=## Recent Articles)/);
  if (sections.length > 1) {
    // Keep only the last "Recent Articles" section
    text = sections[0] + sections[sections.length - 1];
  }
  
  // Fix broken image markdown
  text = text.replace(/!\[([^\]]*)\]\s*\(([^)]+)\)/g, '![$1]($2)\n\n');
  
  // Remove any SOURCE: prefixes that might be in the response
  text = text.replace(/SOURCE:\s+/g, '');
  
  // Fix any links that have extra brackets or parentheses
  text = text.replace(/\[\[([^\]]+)\]\]\(([^)]+)\)/g, '[$1]($2)');
  
  // Fix broken links that don't start with http
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, linkText, url) => {
      if (!url.startsWith('http')) {
        if (url.startsWith('www.')) {
          return `[${linkText}](https://${url})`;
        }
      }
      return match;
    }
  );
  
  // Remove double asterisks from related topics
  const relatedTopicsMatch = text.match(/## Related Topics\s+([\s\S]*?)(?=##|$)/);
  if (relatedTopicsMatch && relatedTopicsMatch[1]) {
    const topicsText = relatedTopicsMatch[1];
    const cleanedTopics = topicsText
      .split(/\r?\n/)
      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim()))
      .map(line => {
        // Clean up any markdown formatting in topics
        let topic = line.replace(/^[*-]\s+|\d+\.\s+/, '').trim();
        topic = topic.replace(/\*\*/g, ''); // Remove bold markers
        topic = topic.replace(/\*/g, '');   // Remove italic markers
        topic = topic.replace(/`/g, '');    // Remove code markers
        return `* ${topic}`;
      })
      .join('\n');
    
    // Replace the Related Topics section with cleaned version
    text = text.replace(/## Related Topics[\s\S]*?(?=##|$)/, `## Related Topics\n${cleanedTopics}\n\n`);
  } else {
    // Add the "Related Topics" section if it doesn't exist
    text += '\n\n## Related Topics\n* Related topic 1\n* Related topic 2\n* Related topic 3';
  }
  
  // Remove any excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text;
}

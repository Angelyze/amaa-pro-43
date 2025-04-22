import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEYS = [
  Deno.env.get('GEMINI_API_KEY_1') || '',
  Deno.env.get('GEMINI_API_KEY_2') || '',
  Deno.env.get('GEMINI_API_KEY_3') || '',
];
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY') || '';
const XAI_API_KEY = Deno.env.get('XAI_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { message, type, file, photoContext } = await req.json();
    console.log('Received request:', { 
      message, 
      type, 
      file: file ? 'File present' : 'No file',
      photoContext: photoContext ? 'Photo context present' : 'No photo context' 
    });
    
    if (type === 'research') {
      return await handleResearchQuery(message);
    } else if (type === 'web-search') {
      return await handlePerplexitySearch(message);
    } else if (type === 'upload' && file) {
      if (photoContext) {
        return await handleGeminiFileAnalysis(photoContext, file);
      } else {
        return new Response(
          JSON.stringify({ 
            response: "I've received your file. What would you like to know about it?",
            model: "system-message"
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } else if (type === 'code') {
      return await handleCodingQuery(message);
    } else {
      return await handleGeminiRegularChat(message);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
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

async function handleGeminiRegularChat(message: string) {
  let lastError = null;
  
  const formattingInstructions = `You are a helpful AI assistant that provides accurate, relevant, and engaging responses. Format your responses using proper Markdown:
- Use headings (## or ###) to organize information
- Format code with backticks
- Use bullet points for lists
- Include source links when referencing external information
- Structure with clear paragraphs

Please respond to this request: `;
  
  const enhancedMessage = formattingInstructions + message;
  
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
              parts: [{ text: enhancedMessage }]
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
      
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      
      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          model: "gemini-2.0-flash"
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (error) {
      console.error(`Error with Gemini API key: ${error.message}`);
      lastError = error;
    }
  }
  
  return new Response(
    JSON.stringify({ error: `All Gemini API keys failed. Last error: ${lastError?.message}` }),
    { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleGeminiFileAnalysis(message: string, file: any) {
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
    let fileData = file.data;
    let imageData;
    
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      imageData = fileData;
    } else {
      imageData = `data:${file.type};base64,${fileData.replace(/^data:image\/\w+;base64,/, '')}`;
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

async function handleResearchQuery(message: string) {
  if (!XAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'XAI API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    console.log('Processing research query:', message);
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': '2024-04'
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [
          {
            role: 'system',
            content: `You are a research assistant focused on providing accurate, in-depth analysis with factual information. 
            Format your responses using proper Markdown with headers, lists, and code blocks where appropriate.
            Always cite sources when available.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      }),
    });

    const responseText = await response.text();
    console.log('XAI API response status:', response.status);
    console.log('XAI API response body:', responseText);

    if (!response.ok) {
      throw new Error(`XAI API error: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing XAI response:', e);
      throw new Error('Invalid JSON response from XAI API');
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format from XAI API');
    }

    return new Response(
      JSON.stringify({ 
        response: data.choices[0].message.content,
        model: "grok-3-latest"
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in research query:', error);
    return new Response(
      JSON.stringify({ 
        error: `Research query failed: ${error.message}`,
        model: "system-message"
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
}

async function handleCodingQuery(message: string) {
  if (!XAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'XAI API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  try {
    console.log('Processing coding query:', message);
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': '2024-04'
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [
          {
            role: 'system',
            content: `You are a world-class senior code assistant. 
Answer only coding, debugging, or software engineering questions.
Be concise, accurate, and provide working code examples in proper Markdown (triple backticks, language tags).
Never answer non-coding questions or change the topic to unrelated content.
Use headings where useful and briefly explain code, with comments.
If relevant, include tips, explain tradeoffs, and mention related documentation.
When citing sources, if possible, give links.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.35,
        max_tokens: 2048,
        stream: false
      }),
    });

    const responseText = await response.text();
    console.log('XAI API response status:', response.status);
    console.log('XAI API response body:', responseText);

    if (!response.ok) {
      throw new Error(`XAI API error: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing XAI response:', e);
      throw new Error('Invalid JSON response from XAI API');
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format from XAI API');
    }

    return new Response(
      JSON.stringify({ 
        response: data.choices[0].message.content,
        model: "grok-3-latest"
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in coding query:', error);
    return new Response(
      JSON.stringify({ 
        error: `Coding query failed: ${error.message}`,
        model: "system-message"
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
}

function cleanUpSearchResponse(text: string): string {
  const sections = text.split(/(?=## Recent Articles)/);
  if (sections.length > 1) {
    text = sections[0] + sections[sections.length - 1];
  }
  
  text = text.replace(/!\[([^\]]*)\]\s*\(([^)]+)\)/g, '![$1]($2)\n\n');
  
  text = text.replace(/SOURCE:\s+/g, '');
  
  text = text.replace(/\[\[([^\]]+)\]\]\(([^)]+)\)/g, '[$1]($2)');
  
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    if (!url.startsWith('http')) {
      if (url.startsWith('www.')) {
        return `[${linkText}](https://${url})`;
      }
    }
    return match;
  });
  
  const relatedTopicsMatch = text.match(/## Related Topics\s+([\s\S]*?)(?=##|$)/);
  if (relatedTopicsMatch && relatedTopicsMatch[1]) {
    const topicsText = relatedTopicsMatch[1];
    const cleanedTopics = topicsText
      .split(/\r?\n/)
      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim()))
      .map(line => {
        let topic = line.replace(/^[*-]\s+|\d+\.\s+/, '').trim();
        topic = topic.replace(/\*\*/g, '');
        topic = topic.replace(/\*/g, '');
        topic = topic.replace(/`/g, '');
        return `* ${topic}`;
      })
      .join('\n');
    
    text = text.replace(/## Related Topics[\s\S]*?(?=##|$)/, `## Related Topics\n${cleanedTopics}\n\n`);
  } else {
    text += '\n\n## Related Topics\n* Related topic 1\n* Related topic 2\n* Related topic 3';
  }
  
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text;
}

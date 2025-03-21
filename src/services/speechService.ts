
// Get the cached audio element or create a new one
let audioElement: HTMLAudioElement | null = null;

const getAudioElement = (): HTMLAudioElement => {
  if (!audioElement) {
    audioElement = new Audio();
  }
  return audioElement;
};

export interface VoiceOption {
  id: string;
  name: string;
  description?: string;
}

// Initialize browser voices
let BROWSER_VOICES: VoiceOption[] = [];

// Default voice ID for Google UK English Male
const DEFAULT_VOICE_ID = 'browser-0';

// Function to get available browser voices
export const getBrowserVoices = (): VoiceOption[] => {
  if (BROWSER_VOICES.length > 0) return BROWSER_VOICES;
  
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    // Find UK English Male voice and prioritize it
    const ukMaleIndex = voices.findIndex(voice => 
      voice.name.toLowerCase().includes('uk english male') || 
      (voice.lang === 'en-GB' && voice.name.toLowerCase().includes('male'))
    );
    
    // Reorder voices to put UK English Male first if found
    if (ukMaleIndex > 0) {
      const ukMaleVoice = voices[ukMaleIndex];
      voices.splice(ukMaleIndex, 1);
      voices.unshift(ukMaleVoice);
    }
    
    if (voices.length > 0) {
      BROWSER_VOICES = voices.map((voice, index) => ({
        id: `browser-${index}`,
        name: voice.name,
        description: voice.lang
      }));
    }
  }
  
  return BROWSER_VOICES;
};

// Get all available voices
export const getAllVoices = (): VoiceOption[] => {
  return getBrowserVoices();
};

// Initialize voice list
if ('speechSynthesis' in window) {
  // Chrome loads voices asynchronously
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = getBrowserVoices;
  }
  // Initial load of voices
  getBrowserVoices();
}

// Helper function to clean markdown content
const cleanMarkdown = (text: string): string => {
  // Remove markdown formatting while preserving content
  return text
    .replace(/#+\s+/g, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italics
    .replace(/`{3}([\s\S]*?)`{3}/g, 'Code block: $1') // Convert code blocks
    .replace(/`([^`]*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Convert links to just text
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, 'Image: $1') // Convert image references
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/>\s+(.*?)(\n|$)/g, '$1\n') // Convert blockquotes
    .replace(/\n\s*[-*+]\s+/g, '\n• ') // Convert bullet points to spoken bullets
    .replace(/\n\s*\d+\.\s+/g, '\n. ') // Convert numbered lists to spoken points
    .replace(/\n\s*-\s+\[([ x])\]\s+/g, (match, checked) => 
      checked === 'x' ? '\n• Checked: ' : '\n• Unchecked: '
    ) // Convert task lists
    .replace(/\|([^|]+)\|/g, '$1') // Simplify tables
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .trim();
};

export const textToSpeech = async (text: string): Promise<void> => {
  // Clean markdown formatting for better text-to-speech
  const cleanedText = cleanMarkdown(text);
  console.log('TTS Processing text length:', cleanedText.length, 'characters');
  
  try {
    // Get voice settings from localStorage
    const voiceId = localStorage.getItem('tts_voice') || DEFAULT_VOICE_ID;
    
    // Use browser TTS for all voices
    return useBrowserTTS(cleanedText, voiceId);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Fallback to default voice if selected voice fails
    return useBrowserTTS(cleanedText);
  }
};

// Break long text into smaller chunks to ensure proper reading
const chunkText = (text: string): string[] => {
  // Split by sentences for natural reading
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  
  // Smaller chunk size for better reliability
  const maxChunkSize = 150;
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < maxChunkSize) {
      // Add sentence to current chunk if it fits
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      // Store current chunk and start a new one
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // Start new chunk with current sentence
      currentChunk = sentence;
    }
  }
  
  // Add the last chunk if there is one
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

const useBrowserTTS = async (text: string, voiceId?: string): Promise<void> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Split text into manageable chunks for sequential reading
      const textChunks = chunkText(text);
      console.log(`Speaking ${textChunks.length} chunks of text`);
      
      // Create all utterances upfront
      const utterances = textChunks.map(chunk => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        
        // Set voice if specified
        if (voiceId && voiceId.startsWith('browser-')) {
          const voiceIndex = parseInt(voiceId.split('-')[1], 10);
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > voiceIndex) {
            utterance.voice = voices[voiceIndex];
          }
        }
        
        // Set additional properties for better speech
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        return utterance;
      });
      
      // Setup sequential speaking with proper event handlers
      let currentIndex = 0;
      
      const speakNext = () => {
        if (currentIndex < utterances.length) {
          const currentUtterance = utterances[currentIndex];
          try {
            window.speechSynthesis.speak(currentUtterance);
            
            // Fix for Chrome issue where onend doesn't fire
            // Force checking if speaking has finished
            const checkSpeaking = setInterval(() => {
              if (!window.speechSynthesis.speaking) {
                clearInterval(checkSpeaking);
                currentIndex++;
                speakNext();
              }
            }, 100);
          } catch (e) {
            console.error('Error speaking chunk:', e);
            currentIndex++;
            speakNext();
          }
        } else {
          resolve();
        }
      };
      
      // Start with the first utterance
      if (utterances.length > 0) {
        speakNext();
      } else {
        resolve(); // Nothing to speak
      }
    } else {
      resolve(); // No TTS available
    }
  });
};

export const stopSpeech = (): void => {
  // Stop browser's speech synthesis if running
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechAvailable = (): boolean => {
  // Check if device supports speech synthesis
  return 'speechSynthesis' in window;
};

export const getCurrentVoice = (): VoiceOption => {
  const voiceId = localStorage.getItem('tts_voice') || DEFAULT_VOICE_ID;
  const allVoices = getAllVoices();
  return allVoices.find(voice => voice.id === voiceId) || allVoices[0];
};

export const setVoice = (voiceId: string): void => {
  localStorage.setItem('tts_voice', voiceId);
};

export const getAutoReadSetting = (): boolean => {
  return localStorage.getItem('tts_auto_read') === 'true';
};

export const setAutoReadSetting = (autoRead: boolean): void => {
  localStorage.setItem('tts_auto_read', autoRead.toString());
};

import { toast } from 'sonner';

export interface VoiceOption {
  id: string;
  name: string;
  lang?: string;
  description?: string;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isPlaying = false;
let playQueue: string[] = [];
let currentChunkIndex = 0;

// Available Gemini voice options
const GEMINI_VOICES = [
  { id: 'gemini-en-male-1', name: 'Mark', lang: 'en-US', description: 'Gemini - Male (US)' },
  { id: 'gemini-en-female-1', name: 'Olivia', lang: 'en-US', description: 'Gemini - Female (US)' },
  { id: 'gemini-en-male-2', name: 'James', lang: 'en-GB', description: 'Gemini - Male (UK)' },
  { id: 'gemini-en-female-2', name: 'Emma', lang: 'en-GB', description: 'Gemini - Female (UK)' },
];

// Helper to identify the UK male voice for fallback
const findGoogleUKMaleVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  return voices.find(voice => 
    voice.name.toLowerCase().includes('uk english male') || 
    (voice.name.toLowerCase().includes('uk') && voice.name.toLowerCase().includes('male'))
  );
};

// Get all available voices (Gemini + browser)
export const getAllVoices = (): VoiceOption[] => {
  let voices: VoiceOption[] = [...GEMINI_VOICES]; // Start with Gemini voices
  
  // Add browser voices if available
  if ('speechSynthesis' in window) {
    const browserVoices = window.speechSynthesis.getVoices();
    
    if (browserVoices.length > 0) {
      browserVoices.forEach((voice, index) => {
        voices.push({
          id: `browser-${index}`,
          name: voice.name,
          lang: voice.lang,
          description: 'Browser'
        });
      });
    } else {
      // Add some default browser voices as fallback
      voices.push(
        { id: 'browser-default-uk-male', name: 'Google UK English Male', lang: 'en-GB', description: 'Browser Fallback' },
        { id: 'browser-default-uk-female', name: 'Google UK English Female', lang: 'en-GB', description: 'Browser Fallback' },
        { id: 'browser-default-us-male', name: 'Google US English Male', lang: 'en-US', description: 'Browser Fallback' },
        { id: 'browser-default-us-female', name: 'Google US English Female', lang: 'en-US', description: 'Browser Fallback' }
      );
    }
  }
  
  // Sort voices alphabetically
  return voices.sort((a, b) => a.name.localeCompare(b.name));
};

// Get the current voice setting from localStorage or use default
export const getCurrentVoice = (): VoiceOption => {
  const savedVoiceId = localStorage.getItem('tts_voice');
  const voices = getAllVoices();
  
  // If we have a saved voice and it exists in our available voices, use it
  if (savedVoiceId) {
    const foundVoice = voices.find(v => v.id === savedVoiceId);
    if (foundVoice) return foundVoice;
  }
  
  // Default to first Gemini voice as preferred
  const geminiVoice = voices.find(v => v.id.startsWith('gemini-'));
  if (geminiVoice) return geminiVoice;
  
  // Otherwise, try to find the UK male voice
  const ukMaleVoice = voices.find(v => 
    v.name.toLowerCase().includes('uk english male') || 
    (v.name.toLowerCase().includes('uk') && v.name.toLowerCase().includes('male'))
  );
  
  if (ukMaleVoice) return ukMaleVoice;
  
  // Return the first available voice as fallback
  return voices.length > 0 ? voices[0] : { id: 'gemini-en-male-1', name: 'Mark', lang: 'en-US', description: 'Gemini - Male (US)' };
};

// Save voice setting to localStorage
export const setVoice = (voiceId: string): void => {
  localStorage.setItem('tts_voice', voiceId);
};

// Get auto-read setting
export const getAutoReadSetting = (): boolean => {
  const setting = localStorage.getItem('auto_read_messages');
  return setting === 'true';
};

// Save auto-read setting
export const setAutoReadSetting = (value: boolean): void => {
  localStorage.setItem('auto_read_messages', value.toString());
};

// Helper function to find the actual SpeechSynthesisVoice from voice ID
const getSpeechSynthesisVoiceFromId = (voiceId: string): SpeechSynthesisVoice | null => {
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0 && voiceId.startsWith('browser-')) {
      const index = parseInt(voiceId.replace('browser-', ''), 10);
      if (!isNaN(index) && index < voices.length) {
        return voices[index];
      }
      
      // Handle our default voices
      if (voiceId === 'browser-default-uk-male') {
        const ukMale = findGoogleUKMaleVoice(voices);
        if (ukMale) return ukMale;
      }
      
      // Handle other default voices based on name matching
      const voiceName = voiceId.replace('browser-default-', '').replace(/-/g, ' ');
      const matchedVoice = voices.find(v => v.name.toLowerCase().includes(voiceName));
      if (matchedVoice) return matchedVoice;
    }
  }
  
  return null;
};

// Stop any currently playing speech
export const stopSpeech = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  isPlaying = false;
  playQueue = [];
  currentChunkIndex = 0;
  
  if (currentUtterance) {
    // Remove event listeners
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance = null;
  }
};

// Split text into smaller chunks for better TTS processing
const splitTextIntoChunks = (text: string, maxLength = 250): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + maxLength, text.length);
    
    // Try to end at a sentence boundary
    if (endIndex < text.length) {
      const possibleBoundaries = ['. ', '! ', '? ', '\n'];
      let bestBoundary = -1;
      
      // Find the closest sentence boundary
      for (const boundary of possibleBoundaries) {
        const boundaryIndex = text.lastIndexOf(boundary, endIndex);
        if (boundaryIndex > startIndex && boundaryIndex > bestBoundary) {
          bestBoundary = boundaryIndex + boundary.length - 1;
        }
      }
      
      // If a good boundary is found, use it
      if (bestBoundary > startIndex) {
        endIndex = bestBoundary + 1;
      } else {
        // Otherwise try to end at a word boundary
        const lastSpaceIndex = text.lastIndexOf(' ', endIndex);
        if (lastSpaceIndex > startIndex) {
          endIndex = lastSpaceIndex + 1;
        }
      }
    }
    
    chunks.push(text.substring(startIndex, endIndex));
    startIndex = endIndex;
  }
  
  return chunks;
};

// Function to use the Gemini TTS API via our edge function
const useGeminiTTS = async (text: string, voiceId: string): Promise<string> => {
  try {
    // Extract voice parameters from the ID
    const [_, lang, gender, variant] = voiceId.split('-');
    
    // For now we use a simple mapping - in a real implementation, we'd have a proper API
    // This is a placeholder - in a real implementation, we would call the actual Gemini TTS API
    const response = await fetch('/api/tts-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: {
          language: lang,
          gender: gender,
          variant: variant
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate speech with Gemini TTS');
    }
    
    // Assuming the response contains audio data as base64
    const data = await response.json();
    return data.audioUrl || '';
  } catch (error) {
    console.error('Error using Gemini TTS:', error);
    throw error;
  }
};

// Play audio from a URL (used for Gemini TTS)
const playAudioFromUrl = async (audioUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        reject(error);
      };
      
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error setting up audio playback:', error);
      reject(error);
    }
  });
};

// Main text to speech function
export const textToSpeech = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Stop any current speech
      stopSpeech();
      isPlaying = true;
      
      // Get the selected voice
      const voiceSetting = getCurrentVoice();
      const voiceId = voiceSetting.id;
      
      // Check if we should use Gemini TTS
      if (voiceId.startsWith('gemini-')) {
        try {
          // Split text into manageable chunks for better processing
          playQueue = splitTextIntoChunks(text, 250);
          currentChunkIndex = 0;
          
          const processGeminiChunks = async () => {
            if (currentChunkIndex >= playQueue.length || !isPlaying) {
              isPlaying = false;
              resolve();
              return;
            }
            
            try {
              // Generate and play the audio for current chunk
              const audioUrl = await useGeminiTTS(playQueue[currentChunkIndex], voiceId);
              await playAudioFromUrl(audioUrl);
              
              // Move to the next chunk
              currentChunkIndex++;
              if (isPlaying) {
                processGeminiChunks();
              }
            } catch (error) {
              console.error('Error processing Gemini TTS chunk:', error);
              currentChunkIndex++;
              if (isPlaying) {
                processGeminiChunks();
              }
            }
          };
          
          // Start processing chunks
          processGeminiChunks();
        } catch (error) {
          console.error('Error using Gemini TTS:', error);
          toast.error('Failed with Gemini TTS. Falling back to browser voices.');
          
          // Fall back to browser TTS
          fallbackToBrowserTTS(text, resolve, reject);
        }
      } else {
        // Use browser TTS
        fallbackToBrowserTTS(text, resolve, reject);
      }
    } catch (error) {
      isPlaying = false;
      console.error('TTS error:', error);
      reject(error);
    }
  });
};

// Function to fall back to browser TTS if Gemini TTS fails
const fallbackToBrowserTTS = (text: string, resolve: () => void, reject: (error: any) => void) => {
  try {
    // Make sure we have speech synthesis available
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in your browser');
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    
    // Get the selected voice
    const voiceSetting = getCurrentVoice();
    const voiceId = voiceSetting.id;
    
    // Get actual SpeechSynthesisVoice
    let voice = getSpeechSynthesisVoiceFromId(voiceId);
    
    // Fallback to first available voice if selected voice is not available
    if (!voice && window.speechSynthesis.getVoices().length > 0) {
      voice = window.speechSynthesis.getVoices()[0];
      console.log('Using fallback voice:', voice.name);
    }
    
    if (!voice) {
      console.error('No voice available for TTS');
      toast.error('No voice available for text-to-speech');
      reject(new Error('No voice available'));
      return;
    }
    
    // Split text into manageable chunks
    playQueue = splitTextIntoChunks(text, 250);
    currentChunkIndex = 0;
    
    console.log('Speaking', playQueue.length, 'chunks of text');
    
    const speakNextChunk = () => {
      if (currentChunkIndex >= playQueue.length || !isPlaying) {
        isPlaying = false;
        resolve();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(playQueue[currentChunkIndex]);
      currentUtterance = utterance;
      
      // Set voice and other properties
      utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Safety mechanism: if a chunk doesn't complete in 10 seconds, move to the next one
      const safetyTimeout = setTimeout(() => {
        if (isPlaying && currentUtterance === utterance) {
          console.log('Safety timeout triggered for chunk', currentChunkIndex);
          currentChunkIndex++;
          speakNextChunk();
        }
      }, 10000);
      
      // Clear the timeout when the utterance naturally ends
      utterance.onend = () => {
        clearTimeout(safetyTimeout);
        console.log(`Finished speaking chunk ${currentChunkIndex + 1} of ${playQueue.length}`);
        currentChunkIndex++;
        
        setTimeout(() => {
          if (isPlaying) {
            speakNextChunk();
          }
        }, 10);
      };
      
      utterance.onerror = (event) => {
        clearTimeout(safetyTimeout);
        console.error('Speech error:', event);
        currentChunkIndex++;
        setTimeout(() => {
          if (isPlaying) {
            speakNextChunk();
          }
        }, 10);
      };
      
      // Speak the current chunk
      window.speechSynthesis.speak(utterance);
    };
    
    // Start speaking
    speakNextChunk();
  } catch (error) {
    isPlaying = false;
    console.error('Browser TTS error:', error);
    reject(error);
  }
};

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

// Helper to identify the UK male voice
const findGoogleUKMaleVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  return voices.find(voice => 
    voice.name.toLowerCase().includes('uk english male') || 
    (voice.name.toLowerCase().includes('uk') && voice.name.toLowerCase().includes('male'))
  );
};

// Get all available browser voices
export const getAllVoices = (): VoiceOption[] => {
  const voices: VoiceOption[] = [];
  
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
      // Add some default voices if no browser voices are available
      voices.push(
        { id: 'browser-default-uk-male', name: 'Google UK English Male', lang: 'en-GB', description: 'Default' },
        { id: 'browser-default-uk-female', name: 'Google UK English Female', lang: 'en-GB', description: 'Default' },
        { id: 'browser-default-us-male', name: 'Google US English Male', lang: 'en-US', description: 'Default' },
        { id: 'browser-default-us-female', name: 'Google US English Female', lang: 'en-US', description: 'Default' }
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
  
  // Otherwise, try to find the UK male voice
  const ukMaleVoice = voices.find(v => 
    v.name.toLowerCase().includes('uk english male') || 
    (v.name.toLowerCase().includes('uk') && v.name.toLowerCase().includes('male'))
  );
  
  if (ukMaleVoice) return ukMaleVoice;
  
  // Return the first available voice as fallback
  return voices.length > 0 ? voices[0] : { id: 'browser-default-uk-male', name: 'Google UK English Male', lang: 'en-GB', description: 'Default' };
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
    isPlaying = false;
    playQueue = [];
    currentChunkIndex = 0;
    
    if (currentUtterance) {
      // Remove event listeners
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
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

// Text to speech function with browser voices
export const textToSpeech = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Make sure we have speech synthesis available
      if (!('speechSynthesis' in window)) {
        toast.error('Text-to-speech is not supported in your browser');
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      // Stop any current speech
      stopSpeech();
      isPlaying = true;
      
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
        
        // Handle events
        utterance.onend = () => {
          console.log(`Finished speaking chunk ${currentChunkIndex + 1} of ${playQueue.length}`);
          currentChunkIndex++;
          
          // Reduce delay between chunks for more continuous speech
          setTimeout(() => {
            if (isPlaying) {
              speakNextChunk();
            }
          }, 10);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          // Don't stop completely on error, try to continue with next chunk
          currentChunkIndex++;
          setTimeout(() => {
            if (isPlaying) {
              speakNextChunk();
            }
          }, 10);
        };
        
        // Safety mechanism: if a chunk doesn't complete in 10 seconds, move to the next one
        const safetyTimeout = setTimeout(() => {
          if (isPlaying && currentUtterance === utterance) {
            console.log('Safety timeout triggered for chunk', currentChunkIndex);
            // Instead of canceling all synthesis, just move to next chunk
            currentChunkIndex++;
            speakNextChunk();
          }
        }, 10000);
        
        // Clear the timeout when the utterance naturally ends
        utterance.onend = (event) => {
          clearTimeout(safetyTimeout);
          console.log(`Finished speaking chunk ${currentChunkIndex + 1} of ${playQueue.length}`);
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
      console.error('TTS error:', error);
      reject(error);
    }
  });
};

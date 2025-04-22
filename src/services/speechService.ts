
import { toast } from 'sonner';

// TTS state tracking
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isPlaying = false;
let voicesLoaded = false;

// Voice types
export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  language: string;
  accent?: string;
}

// Local storage keys
const LOCAL_STORAGE_AUTO_READ = 'auto_read_messages';
const LOCAL_STORAGE_VOICE = 'tts_voice';
const DEFAULT_VOICE_NAME = 'Google US English';

// Initialize voices when they're ready
window.speechSynthesis.onvoiceschanged = () => {
  voicesLoaded = true;
  // Set default voice if none is selected
  if (!getCurrentVoice()) {
    const defaultVoice = getVoiceByName(DEFAULT_VOICE_NAME);
    if (defaultVoice) {
      setVoice(defaultVoice.voiceURI);
    }
  }
};

// Get auto-read setting
export const getAutoReadSetting = (): boolean => {
  const setting = localStorage.getItem(LOCAL_STORAGE_AUTO_READ);
  return setting === 'true';
};

// Set auto-read setting
export const setAutoReadSetting = (value: boolean): void => {
  localStorage.setItem(LOCAL_STORAGE_AUTO_READ, value.toString());
};

// Get current voice
export const getCurrentVoice = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_VOICE) || '';
};

// Set voice
export const setVoice = (voiceId: string): void => {
  localStorage.setItem(LOCAL_STORAGE_VOICE, voiceId);
};

// Get voice by name
export const getVoiceByName = (name: string): SpeechSynthesisVoice | undefined => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  return voices.find(voice => voice.name.includes(name));
};

// Get all available voices
export const getAllVoices = (): VoiceOption[] => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  return voices.map(voice => ({
    id: voice.voiceURI,
    name: voice.name,
    gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
    language: voice.lang,
    accent: voice.name.split(' ').slice(1).join(' ')
  }));
};

// Get voice by ID
export const getVoiceById = (id: string): SpeechSynthesisVoice | undefined => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  return voices.find(voice => voice.voiceURI === id);
};

// Wait for voices to load
const waitForVoices = async (): Promise<boolean> => {
  if (voicesLoaded) return true;
  
  return new Promise((resolve) => {
    const maxAttempts = 10;
    let attempts = 0;
    
    const checkVoices = () => {
      attempts++;
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        voicesLoaded = true;
        resolve(true);
      } else if (attempts < maxAttempts) {
        setTimeout(checkVoices, 100);
      } else {
        resolve(false);
      }
    };
    
    checkVoices();
  });
};

// Split text into smaller chunks for better TTS processing
const splitTextIntoChunks = (text: string, maxLength = 200): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + maxLength, text.length);
    
    if (endIndex < text.length) {
      const possibleBoundaries = ['. ', '! ', '? ', '\n'];
      let bestBoundary = -1;
      
      for (const boundary of possibleBoundaries) {
        const boundaryIndex = text.lastIndexOf(boundary, endIndex);
        if (boundaryIndex > startIndex && boundaryIndex > bestBoundary) {
          bestBoundary = boundaryIndex + boundary.length - 1;
        }
      }
      
      if (bestBoundary > startIndex) {
        endIndex = bestBoundary + 1;
      } else {
        const lastSpaceIndex = text.lastIndexOf(' ', endIndex);
        if (lastSpaceIndex > startIndex) {
          endIndex = lastSpaceIndex + 1;
        }
      }
    }
    
    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex;
  }
  
  return chunks;
};

// Stop any currently playing speech
export const stopSpeech = (): void => {
  if (isPlaying) {
    window.speechSynthesis.cancel();
    isPlaying = false;
    currentUtterance = null;
  }
};

// Main text to speech function with retry logic
export const textToSpeech = async (text: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Wait for voices to load
      const voicesLoaded = await waitForVoices();
      if (!voicesLoaded) {
        throw new Error('Failed to load voices');
      }
      
      stopSpeech();
      isPlaying = true;
      
      const synth = window.speechSynthesis;
      const chunks = splitTextIntoChunks(text);
      let currentChunkIndex = 0;
      let retryCount = 0;
      const maxRetries = 3;
      
      const speakNextChunk = () => {
        if (currentChunkIndex >= chunks.length || !isPlaying) {
          isPlaying = false;
          resolve();
          return;
        }
        
        const chunk = chunks[currentChunkIndex];
        console.log(`Speaking chunk ${currentChunkIndex + 1} of ${chunks.length}`);
        
        const utterance = new SpeechSynthesisUtterance(chunk);
        currentUtterance = utterance;
        
        // Get selected voice if available
        const selectedVoiceId = getCurrentVoice();
        if (selectedVoiceId) {
          const voice = getVoiceById(selectedVoiceId);
          if (voice) {
            utterance.voice = voice;
          } else {
            // Fallback to default voice
            const defaultVoice = getVoiceByName(DEFAULT_VOICE_NAME);
            if (defaultVoice) {
              utterance.voice = defaultVoice;
            }
          }
        }
        
        utterance.onend = () => {
          retryCount = 0; // Reset retry count on successful chunk
          currentChunkIndex++;
          if (isPlaying) {
            setTimeout(speakNextChunk, 50);
          }
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying chunk ${currentChunkIndex + 1}, attempt ${retryCount}`);
            setTimeout(speakNextChunk, 500); // Wait longer before retry
          } else {
            toast.error('Speech synthesis failed. Please try again.');
            currentChunkIndex++;
            retryCount = 0;
            if (isPlaying) {
              setTimeout(speakNextChunk, 50);
            }
          }
        };
        
        // Small delay before speaking to prevent race conditions
        setTimeout(() => {
          try {
            synth.speak(utterance);
          } catch (error) {
            console.error('Error speaking:', error);
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(speakNextChunk, 500);
            } else {
              toast.error('Failed to start speech synthesis');
              currentChunkIndex++;
              if (isPlaying) {
                setTimeout(speakNextChunk, 50);
              }
            }
          }
        }, 100);
      };
      
      speakNextChunk();
      
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      isPlaying = false;
      reject(error);
    }
  });
};

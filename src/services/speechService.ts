import { toast } from 'sonner';

// MARS5-TTS API configuration
const MARS5_API_URL = 'https://mars5api.camb.ai/api/tts';

// TTS state tracking
let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

// Voice types based on MARS5-TTS available options
export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  language: string;
  accent?: string;
}

// Available voices (from MARS5-TTS documentation)
export const availableVoices: VoiceOption[] = [
  { id: 'en_female_1', name: 'Emma', gender: 'female', language: 'en', accent: 'US' },
  { id: 'en_female_2', name: 'Clara', gender: 'female', language: 'en', accent: 'US' },
  { id: 'en_male_1', name: 'James', gender: 'male', language: 'en', accent: 'US' },
  { id: 'en_male_2', name: 'Daniel', gender: 'male', language: 'en', accent: 'US' }
];

// Local storage keys
const LOCAL_STORAGE_AUTO_READ = 'auto_read_messages';
const LOCAL_STORAGE_VOICE = 'tts_voice';
const DEFAULT_VOICE = 'en_female_1';

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
  return localStorage.getItem(LOCAL_STORAGE_VOICE) || DEFAULT_VOICE;
};

// Set voice
export const setVoice = (voiceId: string): void => {
  localStorage.setItem(LOCAL_STORAGE_VOICE, voiceId);
};

// Get voice by ID
export const getVoiceById = (id: string): VoiceOption | undefined => {
  return availableVoices.find(voice => voice.id === id);
};

// Get all available voices
export const getAllVoices = (): VoiceOption[] => {
  return availableVoices;
};

// Split text into smaller chunks for better TTS processing
const splitTextIntoChunks = (text: string, maxLength = 500): string[] => {
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
    
    chunks.push(text.substring(startIndex, endIndex));
    startIndex = endIndex;
  }
  
  return chunks;
};

// Create audio from base64 response
const createAudioFromResponse = (audioData: string): HTMLAudioElement => {
  const audio = new Audio(`data:audio/wav;base64,${audioData}`);
  return audio;
};

// Stop any currently playing speech
export const stopSpeech = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isPlaying = false;
};

// Create a cache for TTS audio to improve performance
const ttsCache: { [key: string]: string } = {};

// Request speech from MARS5-TTS API
const requestSpeech = async (text: string, voiceId: string): Promise<string> => {
  // Check cache first
  const cacheKey = `${voiceId}:${text}`;
  if (ttsCache[cacheKey]) {
    return ttsCache[cacheKey];
  }
  
  const response = await fetch(MARS5_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      format: 'wav',
      speed: 1.0,
      pitch: 1.0
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to convert text to speech');
  }
  
  const data = await response.json();
  
  if (!data.audio) {
    throw new Error('No audio data received from MARS5-TTS');
  }
  
  // Cache the result
  ttsCache[cacheKey] = data.audio;
  
  return data.audio;
};

// Main text to speech function using MARS5-TTS
export const textToSpeech = async (text: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      stopSpeech();
      isPlaying = true;
      
      const voiceId = getCurrentVoice();
      const chunks = splitTextIntoChunks(text);
      let currentChunkIndex = 0;
      
      const speakNextChunk = async () => {
        if (currentChunkIndex >= chunks.length || !isPlaying) {
          isPlaying = false;
          resolve();
          return;
        }
        
        try {
          const chunk = chunks[currentChunkIndex];
          console.log(`Speaking chunk ${currentChunkIndex + 1} of ${chunks.length}, length: ${chunk.length} characters`);
          
          const audioData = await requestSpeech(chunk, voiceId);
          const audio = createAudioFromResponse(audioData);
          currentAudio = audio;
          
          audio.onended = () => {
            currentChunkIndex++;
            if (isPlaying) {
              setTimeout(speakNextChunk, 50);
            }
          };
          
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            currentChunkIndex++;
            if (isPlaying) {
              setTimeout(speakNextChunk, 50);
            }
          };
          
          await audio.play();
        } catch (error) {
          console.error('Error in TTS chunk processing:', error);
          currentChunkIndex++;
          if (isPlaying) {
            setTimeout(speakNextChunk, 50);
          }
        }
      };
      
      await speakNextChunk();
    } catch (error) {
      isPlaying = false;
      console.error('TTS error:', error);
      toast.error('Failed to convert text to speech. Please check your connection and try again.');
      reject(error);
    }
  });
};

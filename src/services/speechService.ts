import { supabase } from '@/integrations/supabase/client';

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
  type: 'elevenlabs' | 'browser';
}

// ElevenLabs voices
export const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Professional and clear female voice', type: 'elevenlabs' },
  { id: 'FQvqzw2iFxiZjYjsDPRV', name: 'Bella', description: 'Warm and friendly female voice', type: 'elevenlabs' },
  { id: 'OnwwZ5PIQZXYdAel2BOZ', name: 'Oliver', description: 'British male voice with a confident tone', type: 'elevenlabs' },
  { id: 'eXtrPNUwgqEIyjUzKzKA', name: 'Sam', description: 'Warm American male voice', type: 'elevenlabs' },
  { id: 'vXXfFz9YJ0iXQyPcJn5L', name: 'Emily', description: 'Warm and friendly female voice with American accent', type: 'elevenlabs' },
  { id: 'mTSvIrm2hmcnOvb21nW2', name: 'Ethan', description: 'Mature male voice with a deeper tone', type: 'elevenlabs' },
];

// Initialize browser voices
let BROWSER_VOICES: VoiceOption[] = [];

// Function to get available browser voices
export const getBrowserVoices = (): VoiceOption[] => {
  if (BROWSER_VOICES.length > 0) return BROWSER_VOICES;
  
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      BROWSER_VOICES = voices.map((voice, index) => ({
        id: `browser-${index}`,
        name: voice.name,
        description: `${voice.lang} (Browser)`,
        type: 'browser' as const,
      }));
    }
  }
  
  return BROWSER_VOICES;
};

// Combine all available voices
export const getAllVoices = (): VoiceOption[] => {
  return [...ELEVENLABS_VOICES, ...getBrowserVoices()];
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

export const textToSpeech = async (text: string): Promise<void> => {
  try {
    // Get voice settings from localStorage
    const voiceId = localStorage.getItem('tts_voice') || '9BWtsMINqrJLrRacOk9x'; // Default to Aria
    
    // Check if it's a browser voice
    if (voiceId.startsWith('browser-')) {
      return useBrowserTTS(text, voiceId);
    }
    
    // Otherwise use ElevenLabs
    return useElevenLabsTTS(text, voiceId);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Fallback to browser's built-in TTS if ElevenLabs fails
    return useBrowserTTS(text);
  }
};

const useElevenLabsTTS = async (text: string, voiceId: string): Promise<void> => {
  console.log(`Using ElevenLabs TTS with voice ID: ${voiceId}`);
  
  // Call the Edge Function to convert text to speech
  const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
    body: { text, voiceId },
  });
  
  if (error) {
    console.error('Error calling elevenlabs-tts function:', error);
    throw error;
  }
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate speech');
  }
  
  // Convert base64 to audio and play
  const audio = getAudioElement();
  audio.src = `data:audio/mp3;base64,${data.audioContent}`;
  
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);
    audio.play().catch(reject);
  });
};

const useBrowserTTS = async (text: string, voiceId?: string): Promise<void> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // If a specific browser voice is requested
      if (voiceId && voiceId.startsWith('browser-')) {
        const voiceIndex = parseInt(voiceId.split('-')[1], 10);
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > voiceIndex) {
          utterance.voice = voices[voiceIndex];
        }
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Resolve anyway on error to prevent hanging
      window.speechSynthesis.speak(utterance);
    } else {
      resolve(); // No TTS available
    }
  });
};

export const stopSpeech = (): void => {
  // Stop ElevenLabs audio if playing
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  
  // Stop browser's speech synthesis if running
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechAvailable = (): boolean => {
  // Check if device supports speech synthesis
  return 'speechSynthesis' in window || true; // Always return true since we have ElevenLabs
};

export const getCurrentVoice = (): VoiceOption => {
  const voiceId = localStorage.getItem('tts_voice') || '9BWtsMINqrJLrRacOk9x'; // Default to Aria
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


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

export const textToSpeech = async (text: string): Promise<void> => {
  try {
    // Get voice settings from localStorage
    const voiceId = localStorage.getItem('tts_voice') || DEFAULT_VOICE_ID;
    
    // Use browser TTS
    return useBrowserTTS(text, voiceId);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Fallback to default voice if selected voice fails
    return useBrowserTTS(text);
  }
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

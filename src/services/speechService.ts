
import { supabase } from '@/integrations/supabase/client';

// Get the cached audio element or create a new one
let audioElement: HTMLAudioElement | null = null;

const getAudioElement = (): HTMLAudioElement => {
  if (!audioElement) {
    audioElement = new Audio();
  }
  return audioElement;
};

export const textToSpeech = async (text: string): Promise<void> => {
  try {
    // Get voice settings from localStorage
    const voiceId = localStorage.getItem('tts_voice') || '9BWtsMINqrJLrRacOk9x'; // Default to Aria
    
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
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Fallback to browser's built-in TTS if ElevenLabs fails
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        speechSynthesis.speak(utterance);
      } else {
        resolve(); // No TTS available
      }
    });
  }
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
  return 'speechSynthesis' in window;
};

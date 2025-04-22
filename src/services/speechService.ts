
import { toast } from 'sonner';

let currentUtterance: any = null;
let isPlaying = false;

// Get auto-read setting
export const getAutoReadSetting = (): boolean => {
  const setting = localStorage.getItem('auto_read_messages');
  return setting === 'true';
};

// Save auto-read setting
export const setAutoReadSetting = (value: boolean): void => {
  localStorage.setItem('auto_read_messages', value.toString());
};

// Split text into smaller chunks for better TTS processing
const splitTextIntoChunks = (text: string, maxLength = 250): string[] => {
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

// Stop any currently playing speech
export const stopSpeech = (): void => {
  if (currentUtterance) {
    currentUtterance.pause();
    currentUtterance = null;
  }
  isPlaying = false;
};

// Main text to speech function using Puter.js
export const textToSpeech = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      stopSpeech();
      isPlaying = true;
      
      // Split text into manageable chunks
      const chunks = splitTextIntoChunks(text);
      let currentChunkIndex = 0;
      
      const speakNextChunk = async () => {
        if (currentChunkIndex >= chunks.length || !isPlaying) {
          isPlaying = false;
          resolve();
          return;
        }
        
        try {
          console.log(`Speaking chunk ${currentChunkIndex + 1} of ${chunks.length}`);
          const audio = await (window as any).puter.ai.txt2speech(chunks[currentChunkIndex]);
          currentUtterance = audio;
          
          audio.onended = () => {
            currentChunkIndex++;
            if (isPlaying) {
              setTimeout(speakNextChunk, 10);
            }
          };
          
          audio.onerror = (error: any) => {
            console.error('Audio playback error:', error);
            currentChunkIndex++;
            if (isPlaying) {
              setTimeout(speakNextChunk, 10);
            }
          };
          
          await audio.play();
        } catch (error) {
          console.error('Error in TTS chunk processing:', error);
          currentChunkIndex++;
          if (isPlaying) {
            setTimeout(speakNextChunk, 10);
          }
        }
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

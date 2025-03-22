import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Globe, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface AMAAChatBoxProps {
  onSendMessage: (message: string, type: 'regular' | 'web-search') => void;
  onUploadFile?: (file: File) => void;
  onVoiceInput?: () => void;
  isMinimized?: boolean;
  disabled?: boolean;
}

const AMAAChatBox: React.FC<AMAAChatBoxProps> = ({
  onSendMessage,
  onUploadFile,
  onVoiceInput,
  isMinimized = false,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [activeOption, setActiveOption] = useState<'regular' | 'web-search' | 'upload'>('regular');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(Date.now());
  
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setMessage(transcript);
        
        if (transcript !== lastTranscriptRef.current) {
          lastSpeechTimeRef.current = Date.now();
          clearSilenceTimer();
          startSilenceTimer();
          lastTranscriptRef.current = transcript;
        }
      };
      
      recognitionRef.current.onaudiostart = () => {
        lastSpeechTimeRef.current = Date.now();
      };
      
      recognitionRef.current.onspeechend = () => {
        console.log('Speech ended, starting silence timer');
        startSilenceTimer();
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Voice input error: ${event.error}`);
        setIsListening(false);
        setVoiceInputActive(false);
      };
      
      recognitionRef.current.onend = () => {
        if (voiceInputActive) {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error("Failed to restart voice recognition:", error);
          }
        } else {
          setIsListening(false);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceTimer();
    };
  }, []);
  
  useEffect(() => {
    return () => {
      clearSilenceTimer();
    };
  }, []);
  
  useEffect(() => {
    if (disabled && voiceInputActive) {
      stopVoiceInput();
    }
  }, [disabled]);
  
  useEffect(() => {
    let silenceCheckInterval: number | null = null;
    
    if (voiceInputActive && isListening) {
      silenceCheckInterval = window.setInterval(() => {
        const now = Date.now();
        const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
        
        console.log('Silence check: time since last speech', timeSinceLastSpeech);
        
        if (timeSinceLastSpeech > 1500 && message.trim()) {
          console.log('Silence detected for 1.5s, sending message:', message);
          handleSend();
        }
      }, 500);
    }
    
    return () => {
      if (silenceCheckInterval) {
        clearInterval(silenceCheckInterval);
      }
    };
  }, [voiceInputActive, isListening, message]);
  
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      console.log('Clearing silence timer');
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  
  const startSilenceTimer = () => {
    clearSilenceTimer();
    
    silenceTimerRef.current = window.setTimeout(() => {
      console.log('Silence timer triggered. Message:', message.trim() ? 'Yes' : 'No', 'Voice active:', voiceInputActive);
      if (message.trim() && voiceInputActive) {
        console.log('Auto-sending message after silence');
        handleSend();
      }
    }, 1500);
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message, activeOption === 'web-search' ? 'web-search' : 'regular');
      setMessage('');
      
      if (voiceInputActive) {
        stopVoiceInput();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (file) {
      setActiveOption('upload');
      setUploadedFile(file);
      
      if (onUploadFile) {
        onUploadFile(file);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    if (disabled) return;
    setActiveOption('upload');
    fileInputRef.current?.click();
  };
  
  const stopVoiceInput = () => {
    console.log('Stopping voice input');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceInputActive(false);
    setIsListening(false);
    clearSilenceTimer();
    toast.info('Voice input deactivated');
  };

  const toggleVoiceInput = () => {
    if (disabled) return;
    
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in your browser');
      return;
    }
    
    const newState = !voiceInputActive;
    setVoiceInputActive(newState);
    
    if (newState) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        lastTranscriptRef.current = '';
        lastSpeechTimeRef.current = Date.now();
        console.log('Voice input activated, last speech time set to now');
        toast.success('Voice input activated. Start speaking...');
      } catch (error) {
        console.error('Speech recognition start error:', error);
        toast.error('Could not start voice input');
        setVoiceInputActive(false);
      }
    } else {
      stopVoiceInput();
    }
    
    if (onVoiceInput) {
      onVoiceInput();
    }
  };

  const getPlaceholder = () => {
    if (disabled) return "Sign in to continue chatting...";
    if (activeOption === 'web-search') return "Search the internet...";
    if (activeOption === 'upload') return uploadedFile ? `Ask about ${uploadedFile.name}...` : "Ask about the uploaded file...";
    return "Ask me anything...";
  };

  const handleFocus = () => {
    setInputFocused(true);
  };

  const handleBlur = () => {
    setInputFocused(false);
  };

  return (
    <div className={`w-full ${isMinimized ? 'max-w-lg' : 'max-w-3xl'} mx-auto`}>
      <div className="relative">
        <input
          type="text"
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className={`amaa-input pr-[120px] ${isMinimized ? 'py-3 text-sm' : 'py-4'} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, application/pdf, text/plain"
            disabled={disabled}
          />
          
          <div className="flex items-center gap-0">
            <button 
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none amaa-chatbox-icon ${
                disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' :
                isListening ? 'text-red-500 animate-pulse' :
                voiceInputActive ? 'text-teal' : 'text-muted-foreground hover:text-teal'
              }`}
              aria-label={isListening ? 'Listening...' : 'Toggle voice input'}
            >
              <Mic size={18} />
            </button>
            
            <button
              onClick={triggerFileUpload}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none amaa-chatbox-icon ${
                disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' :
                activeOption === 'upload' 
                  ? (uploadedFile ? 'text-green-500' : 'text-teal') 
                  : 'text-muted-foreground hover:text-teal'
              }`}
            >
              <Upload size={18} />
            </button>
            
            <button
              onClick={() => !disabled && setActiveOption('web-search')}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none amaa-chatbox-icon ${
                disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' :
                activeOption === 'web-search' ? 'text-teal' : 'text-muted-foreground hover:text-teal'
              }`}
            >
              <Globe size={18} />
            </button>
            
            <button
              onClick={() => !disabled && setActiveOption('regular')}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none amaa-chatbox-icon ${
                disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' :
                activeOption === 'regular' ? 'text-teal' : 'text-muted-foreground hover:text-teal'
              }`}
            >
              <Bot size={18} />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className={`ml-1 p-1.5 transition-all duration-300 focus:outline-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-teal-light hover:scale-110 hover:drop-shadow-md'
              }`}
            >
              <img 
                src="/AskIcon.png" 
                alt="Ask" 
                className={`w-6 h-6 transition-opacity duration-300 ${
                  disabled ? 'opacity-30' : inputFocused ? 'opacity-80' : 'opacity-50'
                } ${!disabled && 'hover:opacity-100'}`} 
              />
            </button>
          </div>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="flex justify-center mt-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-full">
            {disabled ? 'Sign in to continue chatting' :
             activeOption === 'regular' ? `Ask AI Assistant${voiceInputActive ? ' - using voice' : ''}` : 
             activeOption === 'web-search' ? `Search the internet${voiceInputActive ? ' - using voice' : ''}` : 
             uploadedFile ? `Ask a question about the uploaded file${voiceInputActive ? ' - using voice' : ''}` : `Upload file${voiceInputActive ? ' - using voice' : ''}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default AMAAChatBox;

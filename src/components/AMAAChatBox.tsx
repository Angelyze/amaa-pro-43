import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ToolIconsRow from './ToolIconsRow';

interface AMAAChatBoxProps {
  onSendMessage: (message: string, type: 'regular' | 'web-search' | 'research' | 'code') => void;
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
  const [activeOption, setActiveOption] = useState<'regular' | 'web-search' | 'upload' | 'research' | 'code'>('regular');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<{
    type: string;
    name: string;
    data: string;
  } | null>(null);
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
      let sendType: 'regular' | 'web-search' | 'research' | 'code' = 'regular';
      if (activeOption === 'web-search') sendType = 'web-search';
      else if (activeOption === 'research') sendType = 'research';
      else if (activeOption === 'code') sendType = 'code';
      onSendMessage(message, sendType);
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
    if (disabled) {
      const isLoggedIn = document.body.hasAttribute('data-user-logged-in');
      return isLoggedIn ? "Upgrade to Premium..." : "Sign in to continue...";
    }
    if (activeOption === 'web-search') return "Search the web...";
    if (activeOption === 'research') return "Ask for in-depth research...";
    if (activeOption === 'code') return "Get code explanations, snippets, or programming help...";
    if (activeOption === 'upload') return uploadedFile ? `Ask about ${uploadedFile.name}...` : "Ask about the file...";
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
          className={`amaa-input pr-[80px] ${isMinimized ? 'py-3 text-sm' : 'py-4'} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
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
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice input</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
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
                  className={`w-6 h-6 transition-opacity duration-300 ask-icon ${
                    disabled ? 'opacity-30' : inputFocused ? 'opacity-80' : 'opacity-50'
                  } ${!disabled && 'hover:opacity-100'}`} 
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="mt-2 flex justify-center items-center w-full">
            <ToolIconsRow
              disabled={disabled}
              activeOption={activeOption}
              setActiveOption={setActiveOption}
              triggerFileUpload={triggerFileUpload}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AMAAChatBox;

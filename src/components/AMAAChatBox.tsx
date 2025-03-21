
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Globe, Bot } from 'lucide-react';
import { Button } from './ui/button';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message, activeOption === 'web-search' ? 'web-search' : 'regular');
      setMessage('');
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
    if (file && onUploadFile) {
      setActiveOption('upload');
      setUploadedFile(file);
      onUploadFile(file);
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

  const toggleVoiceInput = () => {
    if (disabled) return;
    setVoiceInputActive(!voiceInputActive);
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
              className={`p-1.5 transition-colors focus:outline-none ${
                disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' :
                voiceInputActive ? 'text-teal' : 'text-muted-foreground hover:text-teal'
              }`}
            >
              <Mic size={18} />
            </button>
            
            <button
              onClick={triggerFileUpload}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none ${
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
              className={`p-1.5 transition-colors focus:outline-none ${
                disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' :
                activeOption === 'web-search' ? 'text-teal' : 'text-muted-foreground hover:text-teal'
              }`}
            >
              <Globe size={18} />
            </button>
            
            <button
              onClick={() => !disabled && setActiveOption('regular')}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none ${
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
             uploadedFile ? `${uploadedFile.type.includes('image') ? 'Photo' : 'Document'} uploaded${voiceInputActive ? ' - using voice' : ''}` : `Upload file${voiceInputActive ? ' - using voice' : ''}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default AMAAChatBox;

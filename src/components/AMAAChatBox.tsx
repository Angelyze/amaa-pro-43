
import React, { useState } from 'react';
import { Mic, Send, Upload, Globe, Bot } from 'lucide-react';
import { Button } from './ui/button';

interface AMAAChatBoxProps {
  onSendMessage: (message: string, type: 'regular' | 'web-search') => void;
  onUploadFile?: (file: File) => void;
  onVoiceInput?: () => void;
  isMinimized?: boolean;
}

const AMAAChatBox: React.FC<AMAAChatBoxProps> = ({
  onSendMessage,
  onUploadFile,
  onVoiceInput,
  isMinimized = false
}) => {
  const [message, setMessage] = useState('');
  const [activeOption, setActiveOption] = useState<'regular' | 'web-search'>('regular');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, activeOption);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadFile) {
      onUploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${isMinimized ? 'max-w-lg' : 'max-w-3xl'} mx-auto`}>
      <div className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeOption === 'regular' ? "Ask me anything..." : "Search the web..."}
          className={`amaa-input pr-[130px] ${isMinimized ? 'py-3 text-sm' : 'py-4'}`}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, application/pdf, text/plain"
          />
          
          {/* Reordered buttons: Mic, Upload, Web, Ask (Bot) */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onVoiceInput}
            className="rounded-full w-9 h-9 text-muted-foreground hover:text-teal hover:bg-teal/10"
          >
            <Mic size={18} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={triggerFileUpload}
            className="rounded-full w-9 h-9 text-muted-foreground hover:text-teal hover:bg-teal/10"
          >
            <Upload size={18} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveOption('web-search')}
            className={`rounded-full w-9 h-9 ${activeOption === 'web-search' ? 'text-teal bg-teal/10' : 'text-muted-foreground hover:text-teal hover:bg-teal/10'}`}
          >
            <Globe size={18} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveOption('regular')}
            className={`rounded-full w-9 h-9 ${activeOption === 'regular' ? 'text-teal bg-teal/10' : 'text-muted-foreground hover:text-teal hover:bg-teal/10'}`}
          >
            <Bot size={18} />
          </Button>
          
          <Button 
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            className="rounded-full w-9 h-9 bg-teal text-white hover:bg-teal-light"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="flex justify-center mt-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-full">
            {activeOption === 'regular' ? 'Ask AI Assistant' : 'Search recent web content'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AMAAChatBox;

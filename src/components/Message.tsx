
import React, { useState } from 'react';
import { Copy, Share2, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  timestamp?: string;
}

const Message: React.FC<MessageProps> = ({ content, type, timestamp }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  
  const formatTimestamp = () => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const handleShare = () => {
    // This is a placeholder for the actual share functionality
    toast.info('Sharing feature coming soon');
  };
  
  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  
  const getFontSize = () => {
    switch (textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };
  
  const cycleTextSize = () => {
    const sizes: ('normal' | 'large' | 'small')[] = ['normal', 'large', 'small'];
    const currentIndex = sizes.indexOf(textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setTextSize(sizes[nextIndex]);
  };

  return (
    <div className="flex justify-center mb-4">
      <div className={`${type === 'user' ? 'user-message' : 'assistant-message'}`}>
        <div className={`${getFontSize()} whitespace-pre-wrap`}>
          {content}
        </div>
        
        {timestamp && (
          <div className="mt-2 text-xs text-muted-foreground">
            {formatTimestamp()}
          </div>
        )}
        
        {type === 'assistant' && (
          <div className="mt-3 flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTextSize}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
            >
              <span className="text-xs font-medium">Aa</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
            >
              <Copy size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTextToSpeech}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
            >
              <Share2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

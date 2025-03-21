
import React, { useState, useEffect } from 'react';
import { Copy, Share2, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { textToSpeech, stopSpeech, getAutoReadSetting } from '@/services/speechService';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  timestamp?: string;
}

const Message: React.FC<MessageProps> = ({ content, type, timestamp }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  
  // Auto-read assistant messages if enabled
  useEffect(() => {
    if (type === 'assistant' && getAutoReadSetting()) {
      handleTextToSpeech();
    }
  }, [content, type]);
  
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
  
  const handleTextToSpeech = async () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    
    try {
      // Use our improved TTS service
      await textToSpeech(content);
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      toast.error('Failed to read text. Falling back to browser voices.');
      
      // We don't need an explicit fallback here as it's handled in the textToSpeech function
    } finally {
      setIsSpeaking(false);
    }
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

  // Custom renderer components for ReactMarkdown
  const renderers = {
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-teal hover:text-teal-light underline"
      >
        {children}
      </a>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-4 last:mb-0">{children}</p>
    ),
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-md font-bold mb-2 mt-4 first:mt-0">{children}</h3>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-1">{children}</li>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-teal pl-4 italic my-4">{children}</blockquote>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-muted p-4 rounded-md overflow-x-auto mb-4 text-sm">
          <code className="font-mono" {...props}>
            {children}
          </code>
        </pre>
      );
    },
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-border">{children}</table>
      </div>
    ),
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="border border-border bg-muted p-2 text-left font-semibold">{children}</th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="border border-border p-2">{children}</td>
    ),
  };

  return (
    <div className="flex justify-center mb-4">
      <div className={`${type === 'user' ? 'user-message' : 'assistant-message'}`}>
        <div className={`${getFontSize()} prose-container`}>
          {type === 'user' ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <ReactMarkdown 
              components={renderers}
              className="markdown-content"
            >
              {content}
            </ReactMarkdown>
          )}
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

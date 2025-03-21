
import React, { useState } from 'react';
import { Share2, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { textToSpeech, stopSpeech, getAutoReadSetting } from '@/services/speechService';
import ShareMenu from './ShareMenu';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  timestamp?: string;
}

// Function to strip all markdown for TTS
const stripMarkdown = (text: string): string => {
  // Replace headers
  let cleaned = text.replace(/^#{1,6}\s+/gm, '');
  
  // Replace bold and italic
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  
  // Replace code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Replace links
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  
  // Replace lists
  cleaned = cleaned.replace(/^[*-]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  
  return cleaned;
};

const Message: React.FC<MessageProps> = ({ content, type, timestamp }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  
  // Auto-read assistant messages if enabled
  React.useEffect(() => {
    if (type === 'assistant' && getAutoReadSetting()) {
      handleTextToSpeech();
    }
  }, [content, type]);
  
  const formatTimestamp = () => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleShare = () => {
    setIsShareMenuOpen(true);
  };
  
  const handleTextToSpeech = async () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    
    try {
      // Clean the markdown content for TTS
      const cleanText = stripMarkdown(content);
      console.log('Starting TTS with cleaned content length:', cleanText.length);
      
      await textToSpeech(cleanText);
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      toast.error('Failed to read text. Falling back to browser voices.');
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
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
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
      <div className={`${type === 'user' ? 'user-message' : 'assistant-message'} relative`}>
        {type === 'assistant' && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTextSize}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
              title="Change text size"
            >
              <span className="text-xs font-medium">Aa</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTextToSpeech}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
              title={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-teal hover:bg-teal/10"
              title="Share"
            >
              <Share2 size={14} />
            </Button>
          </div>
        )}
        
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
        
        {isShareMenuOpen && (
          <ShareMenu 
            content={content} 
            onClose={() => setIsShareMenuOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Message;

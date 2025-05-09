import React, { useState, useEffect } from 'react';
import { Share2, Volume2, VolumeX, Globe, Calendar, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { 
  textToSpeech, 
  stopSpeech, 
  pauseSpeech, 
  resumeSpeech, 
  getAutoReadSetting 
} from '@/services/speechService';
import ShareMenu from './ShareMenu';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  timestamp?: string;
  fileData?: {
    type: string;
    name: string;
    data: string;
  };
  onTopicClick?: (topic: string) => void;
}

const stripMarkdown = (text: string): string => {
  let cleaned = text.replace(/^#{1,6}\s+/gm, '');
  
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  
  cleaned = cleaned.replace(/^[*-]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  
  return cleaned;
};

const ArticlePreview = ({ title, url, date, description, imageUrl, source }: {
  title: string;
  url: string;
  date: string;
  description: string;
  imageUrl?: string;
  source: string;
}) => (
  <div className="article-preview mb-4 border-b border-border/30 pb-3 last:border-0">
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mb-2 text-theme-accent hover:underline font-medium">
      {title}
    </a>
    <div className="flex flex-col sm:flex-row gap-3 mt-2">
      {imageUrl && (
        <div className="search-image-container sm:w-1/4 max-w-[120px]">
          <img 
            src={imageUrl} 
            alt={title} 
            loading="lazy" 
            className="rounded-md object-cover w-full aspect-video border border-border/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none'; // Hide broken images instead of showing placeholder
            }}
          />
        </div>
      )}
      <div className="article-content flex-1">
        <p className="article-description text-sm mb-1">{description}</p>
        <div className="article-meta text-xs text-muted-foreground flex flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="inline" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={12} className="inline" />
            <span>Source: </span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">
              {source}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Message: React.FC<MessageProps> = ({ content, type, timestamp, fileData, onTopicClick }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>(content);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  
  useEffect(() => {
    if (type === 'assistant') {
      let cleanedContent = content;

      cleanedContent = cleanedContent.replace(/^---$/gm, '');
      cleanedContent = cleanedContent.replace(/^___+$/gm, '');
      cleanedContent = cleanedContent.replace(/^\*\*\*+$/gm, '');

      const relatedTopicsMatch = cleanedContent.match(/## Related Topics\s+([\s\S]*?)(?=##|$)/);
      if (relatedTopicsMatch && relatedTopicsMatch[1]) {
        const topicsText = relatedTopicsMatch[1];
        const topics = topicsText
          .split(/\r?\n/)
          .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^[*-]\s+|\d+\.\s+/, '').trim())
          .filter(topic => topic.length > 0)
          .map(topic => topic.replace(/\*\*/g, ''));
        
        setRelatedTopics(topics);
        
        cleanedContent = cleanedContent.replace(/## Related Topics[\s\S]*?(?=##|$)/, '');
      }

      setProcessedContent(cleanedContent);
    } else {
      setProcessedContent(content);
    }
  }, [content, type]);
  
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
      const cleanText = stripMarkdown(content);
      console.log('Starting TTS with cleaned content length:', cleanText.length);
      
      await textToSpeech(cleanText);
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      toast.error('Failed to read text.');
    } finally {
      setIsSpeaking(false);
    }
  };
  
  const handleTopicClick = (topic: string) => {
    if (onTopicClick) {
      onTopicClick(topic);
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

  const isImage = fileData?.type?.startsWith('image/');

  const renderers = {
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
      >
        {children}
      </a>
    ),
    
    p: ({ children }: { children: React.ReactNode }) => {
      const containsImage = React.Children.toArray(children).some(
        child => React.isValidElement(child) && child.props?.src
      );
      
      if (containsImage) {
        return <div className="my-4">{children}</div>;
      }
      
      return <p className="mb-4 last:mb-0">{children}</p>;
    },
    
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      if (!src) return null;
      
      return (
        <img 
          src={src} 
          alt={alt || 'Image'} 
          className="max-w-full h-auto rounded-md my-4 border border-border/20"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error(`Failed to load image: ${target.src}`);
            target.style.display = 'none'; // Hide broken images completely
          }}
        />
      );
    },
    
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
    ),
    
    h2: ({ children }: { children: React.ReactNode }) => {
      if (String(children).includes('Recent Articles')) {
        return (
          <div className="search-results-header mt-8 mb-4">
            <h2 className="text-lg font-bold pb-2 border-b border-border flex items-center gap-2">
              <FileText size={18} />
              Recent Articles
            </h2>
          </div>
        );
      }
      return <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0">{children}</h2>;
    },
    
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
      <blockquote className="border-l-4 border-primary/70 pl-4 italic my-4 py-1 text-muted-foreground">{children}</blockquote>
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
    
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic">{children}</em>
    )
  };

  return (
    <div className="flex justify-center mb-4">
      <div className={`${type === 'user' ? 'user-message' : 'assistant-message'} relative`}>
        {type === 'assistant' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
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
            
            {isShareMenuOpen && (
              <ShareMenu 
                content={content} 
                onClose={() => setIsShareMenuOpen(false)}
                fileData={fileData}
              />
            )}
          </div>
        )}
        
        {fileData && type === 'assistant' && isImage && (
          <div className="mb-4 w-full flex justify-center">
            <img 
              src={fileData.data} 
              alt={fileData.name} 
              className="max-w-full rounded-md object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error(`Failed to load image: ${target.src}`);
                target.style.display = 'none'; // Hide broken images completely
              }}
            />
          </div>
        )}
        
        {fileData && type === 'user' && (
          <div className="mb-3">
            {isImage ? (
              <img 
                src={fileData.data} 
                alt={fileData.name} 
                className="max-w-full max-h-64 rounded-md object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error(`Failed to load image: ${target.src}`);
                  target.style.display = 'none'; // Hide broken images completely
                }}
              />
            ) : (
              <div className="p-2 border rounded-md bg-muted/30">
                <div className="text-sm font-medium mb-1">Uploaded: {fileData.name}</div>
                <div className="text-xs text-muted-foreground">
                  File type: {fileData.type}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={`${getFontSize()} prose-container ${type === 'assistant' ? 'mt-9' : ''}`}>
          {type === 'user' ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <ReactMarkdown 
              components={renderers}
              className="markdown-content search-results"
            >
              {processedContent}
            </ReactMarkdown>
          )}
        </div>
        
        {relatedTopics.length > 0 && type === 'assistant' && (
          <div className="mt-6 mb-2">
            <h2 className="text-lg font-bold pb-2 border-b border-border flex items-center gap-2">
              Related Topics
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedTopics.map((topic, index) => (
                <button 
                  key={index} 
                  className="px-3 py-1.5 bg-muted/70 rounded-full text-sm hover:bg-muted cursor-pointer transition-all"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {timestamp && (
          <div className="mt-2 text-xs text-muted-foreground">
            {formatTimestamp()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

import React, { useState, useEffect } from 'react';
import { Share2, Volume2, VolumeX, ExternalLink, Globe, Calendar, FileText, Link } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { textToSpeech, stopSpeech, getAutoReadSetting } from '@/services/speechService';
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
}

// Function to strip all markdown for TTS
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

// Modern component to render article previews in search results
const ArticlePreview = ({ title, url, date, description, imageUrl, source }: {
  title: string;
  url: string;
  date: string;
  description: string;
  imageUrl?: string;
  source: string;
}) => (
  <div className="article-preview">
    <a href={url} target="_blank" rel="noopener noreferrer" className="block text-base font-medium theme-link hover:underline transition-colors duration-200 mb-3">
      {title}
    </a>
    <div className="flex flex-col sm:flex-row gap-4">
      {imageUrl && (
        <div className="search-image-container flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={title} 
            loading="lazy" 
            className="rounded-md object-cover border border-border/30 shadow-sm hover:shadow-md transition-all duration-300"
          />
        </div>
      )}
      <div className="article-content flex-1">
        <p className="article-description text-sm mb-2">{description}</p>
        <div className="article-meta text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Source:</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="source-link theme-link hover:underline inline-flex items-center gap-1">
              {source}
              <ExternalLink size={12} className="inline-block" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Message: React.FC<MessageProps> = ({ content, type, timestamp, fileData }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>(content);
  
  useEffect(() => {
    if (type === 'assistant') {
      let cleanedContent = content;
      
      cleanedContent = cleanedContent.replace(/## Recent Articles \{\.search-result-articles\}/g, '## Recent Articles');
      cleanedContent = cleanedContent.replace(/\{\.[\w-]+\}/g, '');
      
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

  const isImage = fileData?.type?.startsWith('image/');

  const renderers = {
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="theme-link underline flex items-center gap-1"
      >
        {children}
        <ExternalLink size={12} className="inline-block" />
      </a>
    ),
    p: ({ children, className }: { children: React.ReactNode, className?: string }) => {
      const hasSearchImage = className?.includes('search-result-image') || 
                            (React.Children.toArray(children).some(child => 
                              React.isValidElement(child) && 
                              child.props.className?.includes('search-result-image')));
      
      if (hasSearchImage) {
        return <div className="search-image-container">{children}</div>;
      }
      return <p className="mb-4 last:mb-0">{children}</p>;
    },
    img: ({ src, alt, className }: { src?: string; alt?: string; className?: string }) => {
      if (className?.includes('search-result-image')) {
        return (
          <div className="inline-block mx-1 my-1">
            <img 
              src={src} 
              alt={alt || 'Search result image'} 
              className="search-result-image max-h-24 rounded-md object-cover border border-border/50 shadow-sm"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error(`Failed to load image: ${target.src}`);
                target.src = '/placeholder.svg';
                target.alt = 'Image not available';
                target.className = 'search-result-image max-h-24 rounded-md object-cover border border-border/50 bg-muted/20';
              }}
            />
          </div>
        );
      }
      
      return (
        <img 
          src={src} 
          alt={alt || 'Image'} 
          className="max-w-full h-auto rounded-md my-2"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error(`Failed to load image: ${target.src}`);
            target.src = '/placeholder.svg';
            target.alt = 'Image not available';
            target.className = 'max-w-full h-auto rounded-md my-2 bg-muted/20';
          }}
        />
      );
    },
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
    ),
    h2: ({ children, className }: { children: React.ReactNode, className?: string }) => {
      if (String(children).includes('Recent Articles') || className?.includes('search-result-articles')) {
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
      <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>
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
                target.src = '/placeholder.svg';
                target.alt = 'Image not available';
                target.className = 'max-w-full rounded-md object-contain bg-muted/20';
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
                  target.src = '/placeholder.svg';
                  target.alt = 'Image not available';
                  target.className = 'max-w-full max-h-64 rounded-md object-contain bg-muted/20';
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
        
        <div className={`${getFontSize()} prose-container`}>
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

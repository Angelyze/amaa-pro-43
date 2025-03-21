
import React, { useRef, useEffect } from 'react';
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail, 
  Link,
  MessageSquare,
  X,
  Share2
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareMenuProps {
  content: string;
  onClose: () => void;
}

const ShareMenu: React.FC<ShareMenuProps> = ({ content, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Prepare content for sharing (truncate if too long)
  const shareText = content.length > 280 
    ? content.substring(0, 277) + '...' 
    : content;
  
  // Encode for URLs
  const encodedText = encodeURIComponent(shareText);
  
  // Different share functions
  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(url, '_blank');
    onClose();
  };
  
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`;
    window.open(url, '_blank');
    onClose();
  };
  
  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=Shared%20from%20AMAA&summary=${encodedText}`;
    window.open(url, '_blank');
    onClose();
  };
  
  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
    onClose();
  };
  
  const shareViaEmail = () => {
    const url = `mailto:?subject=Shared%20from%20AMAA&body=${encodedText}`;
    window.location.href = url;
    onClose();
  };
  
  const shareToReddit = () => {
    const url = `https://www.reddit.com/submit?url=${window.location.href}&title=${encodedText}`;
    window.open(url, '_blank');
    onClose();
  };
  
  const shareToThreads = () => {
    // There's no direct sharing URL for Threads, but we can copy the content
    // and suggest opening Threads
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard for sharing to Threads');
    onClose();
  };
  
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
    onClose();
  };
  
  return (
    <div 
      ref={menuRef}
      className="absolute bottom-10 right-0 bg-background border border-border rounded-lg shadow-lg p-3 z-50"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Share to</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareToTwitter}
        >
          <Twitter size={16} className="mb-1" />
          <span className="text-xs">Twitter</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareToFacebook}
        >
          <Facebook size={16} className="mb-1" />
          <span className="text-xs">Facebook</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareToLinkedIn}
        >
          <Linkedin size={16} className="mb-1" />
          <span className="text-xs">LinkedIn</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareToWhatsApp}
        >
          <MessageSquare size={16} className="mb-1" />
          <span className="text-xs">WhatsApp</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareViaEmail}
        >
          <Mail size={16} className="mb-1" />
          <span className="text-xs">Email</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareToReddit}
        >
          <Share2 size={16} className="mb-1" />
          <span className="text-xs">Reddit</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={shareToThreads}
        >
          <Share2 size={16} className="mb-1" />
          <span className="text-xs">Threads</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex flex-col items-center p-2" 
          onClick={copyLinkToClipboard}
        >
          <Link size={16} className="mb-1" />
          <span className="text-xs">Copy Link</span>
        </Button>
      </div>
    </div>
  );
};

export default ShareMenu;

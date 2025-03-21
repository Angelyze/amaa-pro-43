
import React, { useRef, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Mail, Link2, MessageSquare, X, Share2, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareMenuProps {
  content: string;
  onClose: () => void;
}

const ShareMenu: React.FC<ShareMenuProps> = ({
  content,
  onClose
}) => {
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
  const shareText = content.length > 280 ? content.substring(0, 277) + '...' : content;

  // Encode for URLs
  const encodedText = encodeURIComponent(shareText);

  // Different share functions
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`;
    window.open(url, '_blank');
    onClose();
  };
  
  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(url, '_blank');
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
  
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
    onClose();
  };

  return <div ref={menuRef} className="absolute top-10 right-0 bg-background border border-border rounded-lg shadow-lg p-3 z-500 w-72">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Share</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareToFacebook} title="Share to Facebook">
          <Facebook className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareToTwitter} title="Share to X">
          <Twitter className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareToReddit} title="Share to Reddit">
          <MessageCircle className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareToThreads} title="Share to Threads">
          <Share2 className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareToLinkedIn} title="Share to LinkedIn">
          <Linkedin className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareToWhatsApp} title="Share to WhatsApp">
          <MessageSquare className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={shareViaEmail} title="Share via Email">
          <Mail className="h-5 w-5 text-foreground" />
        </Button>
        
        <Button variant="outline" size="icon" className="h-10 w-10 p-2 flex items-center justify-center" onClick={copyLinkToClipboard} title="Copy Link">
          <Link2 className="h-5 w-5 text-foreground" />
        </Button>
      </div>
    </div>;
};

export default ShareMenu;

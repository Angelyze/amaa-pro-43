
import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './ui/button';
import AMAAChatBox from './AMAAChatBox';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  mainSearchVisible: boolean;
  onSendMessage: (message: string, type: 'regular' | 'web-search') => void;
  onScrollToTop: () => void;
}

const Header: React.FC<HeaderProps> = ({ mainSearchVisible, onSendMessage, onScrollToTop }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(!mainSearchVisible);
  }, [mainSearchVisible]);

  return (
    <header 
      className={`header-container ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="w-32 flex items-center">
          <span className="text-xl font-semibold tracking-tight text-gradient">AMAA</span>
        </div>
        
        <div className="flex-1 flex justify-center px-4">
          <AMAAChatBox 
            onSendMessage={onSendMessage}
            isMinimized
          />
        </div>
        
        <div className="w-32 flex items-center justify-end gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onScrollToTop}
            className="rounded-full w-9 h-9"
          >
            <ArrowUp size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

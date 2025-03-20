
import React, { useEffect, useState } from 'react';
import { ArrowUp, User, LogIn, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import AMAAChatBox from './AMAAChatBox';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

interface HeaderProps {
  mainSearchVisible: boolean;
  onSendMessage: (message: string, type: 'regular' | 'web-search') => void;
  onScrollToTop: () => void;
}

const Header: React.FC<HeaderProps> = ({ mainSearchVisible, onSendMessage, onScrollToTop }) => {
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulating auth state
  
  useEffect(() => {
    setVisible(!mainSearchVisible);
  }, [mainSearchVisible]);

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <header 
      className={`header-container fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
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
          {isLoggedIn ? (
            <UserMenu onLogout={toggleLogin} />
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLogin}
                className="text-sm gap-1.5"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Log in</span>
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="bg-teal text-white hover:bg-teal-light text-sm gap-1.5"
              >
                <CreditCard size={16} />
                <span className="hidden sm:inline">Subscribe</span>
              </Button>
            </>
          )}
          
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

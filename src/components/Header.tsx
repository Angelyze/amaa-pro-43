import React, { useEffect, useState } from 'react';
import { ArrowUp, LogIn, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import AMAAChatBox from './AMAAChatBox';
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';

interface HeaderProps {
  mainSearchVisible: boolean;
  onSendMessage: (message: string, type: 'regular' | 'web-search') => void;
  onScrollToTop: () => void;
  isLoggedIn: boolean;
  onLogin: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ 
  mainSearchVisible, 
  onSendMessage, 
  onScrollToTop,
  isLoggedIn,
  onLogin
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Only show header when the main search box is completely out of view
    setVisible(!mainSearchVisible);
  }, [mainSearchVisible]);

  return (
    <header 
      className={`header-container fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="w-32 flex items-center">
          <img src="/AMAApp.png" alt="AMAA" className="h-8" />
        </div>
        
        <div className="flex-1 flex justify-center px-4">
          <AMAAChatBox 
            onSendMessage={onSendMessage}
            isMinimized
          />
        </div>
        
        <div className="w-32 flex items-center justify-end gap-2">
          {isLoggedIn ? (
            <UserMenu onLogout={onLogin} />
          ) : (
            <>
              <Link to="/auth">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm gap-1.5 hover:bg-teal/10 hover:text-teal transition-all"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Log in</span>
                </Button>
              </Link>
              <Link to="/subscribe">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-teal text-white hover:bg-teal-light hover:shadow-md transition-all text-sm gap-1.5"
                >
                  <CreditCard size={16} />
                  <span className="hidden sm:inline">Subscribe</span>
                </Button>
              </Link>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onScrollToTop}
            className="rounded-full w-9 h-9 hover:bg-teal/10 hover:text-teal transition-all"
          >
            <ArrowUp size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

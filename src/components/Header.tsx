
import React, { useEffect, useState } from 'react';
import { ArrowUp, LogIn, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import AMAAChatBox from './AMAAChatBox';
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
      className={`header-container fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      <div className="flex items-center justify-center h-16 px-4 md:px-6 max-w-4xl mx-auto">
        {/* Centered container with max width to contain all three elements */}
        <div className="flex items-center justify-between w-full max-w-2xl">
          {/* Logo positioned immediately left of the chat box */}
          <div className="flex-shrink-0">
            <img src="/AMAApp.png" alt="AMAA.PRO" className="h-8" />
          </div>
          
          {/* Chatbox in center */}
          <div className="flex-1 mx-3">
            <AMAAChatBox 
              onSendMessage={onSendMessage}
              isMinimized
            />
          </div>
          
          {/* Controls positioned immediately right of the chat box */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn ? (
              <UserMenu onLogout={onLogin} />
            ) : (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm gap-1.5 hover:bg-primary/10 hover:text-primary transition-all dark-red:hover:text-[#ff3131] dark-red:hover:bg-[#ff3131]/10 dark-green:hover:text-[#7ed957] dark-green:hover:bg-[#7ed957]/10 dark-yellow:hover:text-[#ffde59] dark-yellow:hover:bg-[#ffde59]/10 dark-purple:hover:text-[#8c52ff] dark-purple:hover:bg-[#8c52ff]/10"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">Log in</span>
                  </Button>
                </Link>
                <Link to="/subscribe">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90 hover:shadow-md transition-all text-sm gap-1.5 dark-red:bg-[#ff3131] dark-red:hover:bg-[#ff3131]/90 dark-green:bg-[#7ed957] dark-green:hover:bg-[#7ed957]/90 dark-yellow:bg-[#ffde59] dark-yellow:hover:bg-[#ffde59]/90 dark-purple:bg-[#8c52ff] dark-purple:hover:bg-[#8c52ff]/90"
                  >
                    <CreditCard size={16} />
                    <span className="hidden sm:inline">Subscribe</span>
                  </Button>
                </Link>
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onScrollToTop}
                  className="rounded-full w-9 h-9 hover:bg-primary/10 hover:text-primary transition-all dark-red:hover:text-[#ff3131] dark-red:hover:bg-[#ff3131]/10 dark-green:hover:text-[#7ed957] dark-green:hover:bg-[#7ed957]/10 dark-yellow:hover:text-[#ffde59] dark-yellow:hover:bg-[#ffde59]/10 dark-purple:hover:text-[#8c52ff] dark-purple:hover:bg-[#8c52ff]/10"
                >
                  <ArrowUp size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scroll to top</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

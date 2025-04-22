
import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, LogIn, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import AMAAChatBox from './AMAAChatBox';
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';

interface HeaderProps {
  mainSearchVisible: boolean;
  onSendMessage: (message: string, type: 'regular' | 'web-search' | 'research') => void;
  onScrollToTop: () => void;
  isLoggedIn: boolean;
  onLogin: () => Promise<void>;
  // New: communicate visibility and height
  onStickyHeaderStateChange?: (params: { visible: boolean; height: number }) => void;
}

const STICKY_HEADER_HEIGHT = 64; // px, exactly matches h-16 below

const Header: React.FC<HeaderProps> = ({
  mainSearchVisible,
  onSendMessage,
  onScrollToTop,
  isLoggedIn,
  onLogin,
  onStickyHeaderStateChange
}) => {
  const [visible, setVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show header when the main search box is out of view
    setVisible(!mainSearchVisible);
  }, [mainSearchVisible]);

  // Communicate header visibility & height to parent
  useEffect(() => {
    if (onStickyHeaderStateChange) {
      const height = headerRef.current?.offsetHeight ?? STICKY_HEADER_HEIGHT;
      onStickyHeaderStateChange({ visible, height });
    }
  }, [visible, onStickyHeaderStateChange]);

  return (
    <header
      ref={headerRef}
      className={`header-container fixed bottom-0 left-0 right-0 z-[9999] bg-background/20 backdrop-blur-md border-t border-border transition-all duration-300
        ${visible ? 'translate-y-0 opacity-99' : 'translate-y-full opacity-0'}`}
      style={{ height: `${STICKY_HEADER_HEIGHT}px` }}
    >
      <div className="flex items-center justify-center h-16 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full max-w-2xl">
          <div className="flex-shrink-0">
            <img src="/AMAApp.png" alt="AMAA" className="h-14" />
          </div>
          <div className="flex-1 mx-3">
            <AMAAChatBox
              onSendMessage={onSendMessage}
              isMinimized
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn ? (
              <UserMenu onLogout={onLogin} />
            ) : (
              <>
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm gap-1.4 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">Log in</span>
                  </Button>
                </Link>
                <Link to="/subscribe">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90 hover:shadow-md transition-all text-sm gap-1.5"
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
              className="rounded-full w-11 h-11 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <ArrowUp size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


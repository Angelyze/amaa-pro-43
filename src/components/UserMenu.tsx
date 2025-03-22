
import { LogOut, Moon, Settings, Sun, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface UserMenuProps {
  onLogout: () => Promise<void>;
  isPremium?: boolean;
}

const UserMenu = ({ onLogout, isPremium }: UserMenuProps) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<string>('light');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // Ensure theme is synchronized on component mount and when localStorage changes
  useEffect(() => {
    // Get the current theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme || 'light');
    
    // Listen for changes to the theme in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setTheme(e.newValue || 'light');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Set avatar URL whenever user changes
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      try {
        // Force browser to reload the image by adding timestamp
        const timestamp = Date.now();
        setAvatarUrl(`${user.user_metadata.avatar_url}?t=${timestamp}`);
      } catch (err) {
        console.error('Error processing avatar URL:', err);
        setAvatarUrl('');
      }
    } else {
      setAvatarUrl('');
    }
  }, [user]);
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  const changeTheme = (value: string) => {
    setTheme(value);
    
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'dark-red');
    
    // Apply the selected theme
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (value === 'dark-red') {
      document.documentElement.classList.add('dark-red');
      localStorage.setItem('theme', 'dark-red');
    } else {
      localStorage.setItem('theme', 'light');
    }
    
    // Dispatch a storage event for other components to detect the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: value
    }));
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 border border-border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : (
              <>
                <AvatarImage src="/ppp.png" alt="Profile" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {userInitials}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          {isPremium && (
            <Badge className="bg-teal hover:bg-teal">Premium</Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link to="/profile">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === 'dark' ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : theme === 'dark-red' ? (
              <Flame className="mr-2 h-4 w-4 text-red-500" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
              <DropdownMenuRadioItem value="light">Default</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Default Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-red">Dark Red</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {!isPremium && (
          <Link to="/subscribe">
            <DropdownMenuItem>
              <span>Upgrade to Premium</span>
            </DropdownMenuItem>
          </Link>
        )}
        
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

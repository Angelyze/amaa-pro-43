
import { LogOut, Moon, Settings, Sun, Flame, Leaf, Cloud } from 'lucide-react';
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
import { changeTheme } from '@/themes/main';
import { toast } from 'sonner';

interface UserMenuProps {
  onLogout: () => Promise<void>;
  isPremium?: boolean;
}

const UserMenu = ({ onLogout, isPremium }: UserMenuProps) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Ensure theme is synchronized on component mount and when localStorage changes
  useEffect(() => {
    // Listen for changes to the theme in localStorage and custom event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setTheme(e.newValue || 'light');
      }
    };
    
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('theme') || 'light';
      console.log(`UserMenu detected theme change: ${newTheme}`);
      setTheme(newTheme);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themechange', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  const handleThemeChange = (value: string) => {
    console.log(`UserMenu changing theme to: ${value}`);
    setTheme(value);
    changeTheme(value);
    toast.success(`Theme changed to ${value}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="/ppp.png" alt="Profile" />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          {isPremium && (
            <Badge className="bg-primary hover:bg-primary">Premium</Badge>
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
            ) : theme === 'dark-green' ? (
              <Leaf className="mr-2 h-4 w-4 text-green-500" />
            ) : theme === 'dark-yellow' ? (
              <Sun className="mr-2 h-4 w-4 text-yellow-500" />
            ) : theme === 'dark-purple' ? (
              <Cloud className="mr-2 h-4 w-4 text-purple-500" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
              <DropdownMenuRadioItem value="light">Default</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Default Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-red">Dark Red</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-green">Dark Green</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-yellow">Dark Yellow</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-purple">Dark Purple</DropdownMenuRadioItem>
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

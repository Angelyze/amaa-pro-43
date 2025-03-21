
import { LogOut, Moon, Settings, Sun } from 'lucide-react';
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
  
  useEffect(() => {
    // Get the current theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);
  
  useEffect(() => {
    // Update avatar URL whenever user changes
    if (user?.user_metadata?.avatar_url) {
      console.log('Setting avatar URL from user metadata:', user.user_metadata.avatar_url);
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  const changeTheme = (value: string) => {
    setTheme(value);
    
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 border border-border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-muted text-muted-foreground">
              {userInitials}
            </AvatarFallback>
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
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
              <DropdownMenuRadioItem value="light">Default</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Default Dark</DropdownMenuRadioItem>
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

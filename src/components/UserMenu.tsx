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
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setTheme(e.newValue || 'light');
      }
    };
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('theme') || 'light';
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

  const avatarUrl: string | null = user?.user_metadata?.avatar_url || null;

  const handleThemeChange = (value: string) => {
    setTheme(value);
    changeTheme(value);
    toast.success(`Theme changed to ${value}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
        <div className="flex items-center gap-2">
          <Avatar 
            className="h-14 w-14 rounded-full bg-muted/0 overflow-hidden shadow-none border-0 p-0 
            transition-all duration-200 group 
            hover:scale-105 hover:brightness-110 
            data-[state=open]:scale-105 data-[state=open]:brightness-110"
          >
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt="Profile picture" 
                className="object-cover w-full h-full rounded-full border-none shadow-none m-0 p-0
                transition-transform duration-300
                group-hover:scale-105 group-data-[state=open]:scale-105"
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  boxShadow: 'none',
                  background: 'none',
                  padding: 0,
                  margin: 0,
                }}
              />
            ) : (
              <AvatarFallback 
                className="bg-muted text-muted-foreground rounded-full w-full h-full p-0 m-0 
                transition-all duration-300
                group-hover:brightness-110 group-data-[state=open]:brightness-110" 
                style={{ border: 'none' }}
              >
                {userInitials}
              </AvatarFallback>
            )}
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
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
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
              <DropdownMenuRadioItem value="light" className="cursor-pointer">Default</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="cursor-pointer">Default Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-red" className="cursor-pointer">Dark Red</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-green" className="cursor-pointer">Dark Green</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-yellow" className="cursor-pointer">Dark Yellow</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark-purple" className="cursor-pointer">Dark Purple</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {!isPremium && (
          <Link to="/subscribe">
            <DropdownMenuItem className="cursor-pointer">
              <span>Upgrade to Premium</span>
            </DropdownMenuItem>
          </Link>
        )}
        
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

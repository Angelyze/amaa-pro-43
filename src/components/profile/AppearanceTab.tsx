
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AppearanceTabProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}

const AppearanceTab = ({ selectedTheme, setSelectedTheme }: AppearanceTabProps) => {
  const themes = [
    { id: 'light', name: 'Default' },
    { id: 'dark', name: 'Default Dark' },
    { id: 'dark-red', name: 'Dark Red' },
  ];

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'dark-red');
    
    // Apply the selected theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'dark-red') {
      document.documentElement.classList.add('dark-red');
      localStorage.setItem('theme', 'dark-red');
    } else {
      localStorage.setItem('theme', 'light');
    }
    
    // Dispatch a storage event for other components to detect the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: theme
    }));
    
    toast.success('Theme updated successfully!');
  };

  return (
    <div>
      <Label htmlFor="theme-selection">Theme</Label>
      <Select
        value={selectedTheme}
        onValueChange={handleThemeChange}
      >
        <SelectTrigger id="theme-selection" className="mt-1.5">
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppearanceTab;

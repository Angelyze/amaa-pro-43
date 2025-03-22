
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { changeTheme } from '@/themes/main';

interface AppearanceTabProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}

const AppearanceTab = ({ selectedTheme, setSelectedTheme }: AppearanceTabProps) => {
  const themes = [
    { id: 'light', name: 'Default' },
    { id: 'dark', name: 'Default Dark' },
    { id: 'dark-red', name: 'Dark Red' },
    { id: 'dark-green', name: 'Dark Green' },
    { id: 'dark-yellow', name: 'Dark Yellow' },
  ];

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    changeTheme(theme); // Use centralized theme function
    toast.success('Theme updated successfully!');
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Appearance</h3>
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
    </div>
  );
};

export default AppearanceTab;


import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { changeTheme } from '@/themes/main';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from 'lucide-react';

interface AppearanceTabProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}

const AppearanceTab = ({ selectedTheme, setSelectedTheme }: AppearanceTabProps) => {
  const themes = [
    { id: 'light', name: 'Default', description: 'Light theme with blue accents' },
    { id: 'dark', name: 'Default Dark', description: 'Dark theme with blue accents' },
    { id: 'dark-red', name: 'Dark Red', description: 'Dark theme with red accents' },
    { id: 'dark-green', name: 'Dark Green', description: 'Dark theme with green accents' },
    { id: 'dark-yellow', name: 'Dark Yellow', description: 'Dark theme with yellow accents' },
    { id: 'dark-purple', name: 'Dark Purple', description: 'Dark theme with purple accents' },
  ];

  const handleThemeChange = (theme: string) => {
    console.log(`AppearanceTab changing theme to: ${theme}`);
    setSelectedTheme(theme);
    changeTheme(theme);
    toast.success(`Theme updated to ${theme}!`);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Appearance</h3>
      <div>
        <div className="flex items-center gap-2">
          <Label htmlFor="theme-selection">Theme</Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info size={16} className="text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme. Each theme has a unique color scheme and link color.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
        
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
        
        <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            This is how <a href="#" onClick={(e) => e.preventDefault()}>links will appear</a> with the selected theme.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;

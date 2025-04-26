
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Currently supported languages (expandable in the future)
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

interface LanguageSelectorProps {
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  // For now, we'll just store the language in state
  // In a full implementation, this would connect to i18n library
  const [currentLang, setCurrentLang] = useState('en');
  
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
  
  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    // Here you would implement actual language switching logic
    // For now just simulate with a console log
    console.log(`Language changed to ${langCode}`);
    
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', langCode);
    
    // In a real implementation, you would reload the page or re-render with new translations
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon" : "sm"} className="flex gap-2 items-center">
          <Globe size={16} />
          {!compact && <span>{currentLanguage.flag} {currentLanguage.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`flex items-center gap-2 cursor-pointer ${
              currentLang === lang.code ? 'bg-muted/50' : ''
            }`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;

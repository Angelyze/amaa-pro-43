
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  VoiceOption,
  getAllVoices,
  getCurrentVoice,
  setVoice,
  setAutoReadSetting,
  textToSpeech
} from '@/services/speechService';

interface VoiceSettingsTabProps {
  autoReadMessages: boolean;
  setAutoReadMessages: (autoRead: boolean) => void;
  saveVoiceSettings: () => void;
}

const VoiceSettingsTab = ({
  autoReadMessages,
  setAutoReadMessages,
  saveVoiceSettings
}: VoiceSettingsTabProps) => {
  const [selectedVoice, setSelectedVoice] = useState(getCurrentVoice());
  const [isTesting, setIsTesting] = useState(false);
  const voices = getAllVoices();
  
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setVoice(voiceId);
  };
  
  const handleSaveSettings = () => {
    setAutoReadSetting(autoReadMessages);
    saveVoiceSettings();
  };
  
  const testVoice = async () => {
    setIsTesting(true);
    try {
      await textToSpeech("This is a test of the CAMB.AI text-to-speech system with the selected voice.");
    } catch (error) {
      console.error('Error testing voice:', error);
      toast.error('Failed to test voice');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Voice Settings</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="auto-read">Auto-read messages</Label>
          <p className="text-xs text-muted-foreground">Automatically read incoming messages</p>
        </div>
        <Switch
          id="auto-read"
          checked={autoReadMessages}
          onCheckedChange={setAutoReadMessages}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="voice-select">Voice</Label>
        <Select value={selectedVoice} onValueChange={handleVoiceChange}>
          <SelectTrigger id="voice-select" className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} ({voice.gender})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the voice that will be used for text-to-speech
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testVoice}
          disabled={isTesting}
          className="flex items-center gap-2"
        >
          <Volume2 size={16} />
          {isTesting ? 'Testing...' : 'Test Voice'}
        </Button>
      </div>
      
      <Button onClick={handleSaveSettings}>Save Voice Settings</Button>
    </div>
  );
};

export default VoiceSettingsTab;

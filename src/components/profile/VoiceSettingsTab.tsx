
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { VoiceOption } from '@/services/speechService';

interface VoiceSettingsTabProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  autoReadMessages: boolean;
  setAutoReadMessages: (autoRead: boolean) => void;
  availableVoices: VoiceOption[];
  saveVoiceSettings: () => void;
}

const VoiceSettingsTab = ({
  selectedVoice,
  setSelectedVoice,
  autoReadMessages,
  setAutoReadMessages,
  availableVoices,
  saveVoiceSettings
}: VoiceSettingsTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="voice-selection">Select Voice</Label>
        <Select
          value={selectedVoice}
          onValueChange={setSelectedVoice}
        >
          <SelectTrigger id="voice-selection" className="mt-1.5">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {availableVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} {voice.description ? `- ${voice.description}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
      
      <Button onClick={saveVoiceSettings}>Save Voice Settings</Button>
    </div>
  );
};

export default VoiceSettingsTab;

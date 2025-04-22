
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

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
  return (
    <div className="space-y-6">
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

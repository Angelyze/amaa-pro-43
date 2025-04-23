import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/ui/layout';
import { Separator } from '@/components/ui/separator';
import ProfileDetailsTab from '@/components/profile/ProfileDetailsTab';
import AppearanceTab from '@/components/profile/AppearanceTab';
import SubscriptionTab from '@/components/profile/SubscriptionTab';
import VoiceSettingsTab from '@/components/profile/VoiceSettingsTab';
import { toast } from 'sonner';
import { 
  getAutoReadSetting,
  setAutoReadSetting
} from '@/services/speechService';

const Profile = () => {
  const { user, isPremium } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  const [autoReadMessages, setAutoReadMessages] = useState(() => {
    return getAutoReadSetting();
  });
  
  const saveVoiceSettings = () => {
    setAutoReadSetting(autoReadMessages);
    toast.success('Voice settings saved successfully!');
  };
  
  return (
    <Layout showBackButton title="Profile Settings" backToHome={true}>
      <div className="container py-10 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your profile information and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ProfileDetailsTab user={user} />
              
              <Separator />
              
              <AppearanceTab 
                selectedTheme={selectedTheme} 
                setSelectedTheme={setSelectedTheme} 
              />
              
              {isPremium && (
                <>
                  <Separator />
                  <SubscriptionTab />
                </>
              )}
              
              {isPremium && (
                <>
                  <Separator />
                  <VoiceSettingsTab 
                    autoReadMessages={autoReadMessages}
                    setAutoReadMessages={setAutoReadMessages}
                    saveVoiceSettings={saveVoiceSettings}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;


import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/ui/layout';
import { 
  getAllVoices,
  setVoice, 
  setAutoReadSetting,
  getCurrentVoice,
  getAutoReadSetting,
  VoiceOption 
} from '@/services/speechService';
import { toast } from 'sonner'; // Add this import for toast

// Import the component tabs
import ProfileDetailsTab from '@/components/profile/ProfileDetailsTab';
import AppearanceTab from '@/components/profile/AppearanceTab';
import SubscriptionTab from '@/components/profile/SubscriptionTab';
import VoiceSettingsTab from '@/components/profile/VoiceSettingsTab';

const Profile = () => {
  const { user, isPremium, refreshSubscriptionStatus } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState(getCurrentVoice().id);
  const [autoReadMessages, setAutoReadMessages] = useState(getAutoReadSetting());
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  // Load avatar URL
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      const timestamp = Date.now();
      setAvatarUrl(`${user.user_metadata.avatar_url}?t=${timestamp}`);
    } else {
      setAvatarUrl('');
    }
  }, [user]);
  
  // Listen for theme changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setSelectedTheme(e.newValue || 'light');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Initialize TTS voices
  useEffect(() => {
    const voices = getAllVoices();
    setAvailableVoices(voices);
    
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      const handleVoicesChanged = () => {
        setAvailableVoices(getAllVoices());
      };
      
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  const saveVoiceSettings = () => {
    setVoice(selectedVoice);
    setAutoReadSetting(autoReadMessages);
    toast.success('Voice settings saved!');
  };
  
  return (
    <Layout showBackButton title="Profile Settings">
      <div className="container py-10 max-w-4xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isPremium && (
              <>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="voice">Voice Settings</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information and avatar.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileDetailsTab 
                  user={user}
                  avatarUrl={avatarUrl}
                  userInitials={userInitials}
                  refreshSubscriptionStatus={refreshSubscriptionStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {isPremium && (
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the appearance of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AppearanceTab 
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isPremium && (
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>Manage your subscription and billing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionTab />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isPremium && (
            <TabsContent value="voice">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Settings</CardTitle>
                  <CardDescription>Customize your text-to-speech experience.</CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceSettingsTab 
                    selectedVoice={selectedVoice}
                    setSelectedVoice={setSelectedVoice}
                    autoReadMessages={autoReadMessages}
                    setAutoReadMessages={setAutoReadMessages}
                    availableVoices={availableVoices}
                    saveVoiceSettings={saveVoiceSettings}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;

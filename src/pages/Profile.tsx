
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/ui/layout';
import { Separator } from '@/components/ui/separator';
import ProfileDetailsTab from '@/components/profile/ProfileDetailsTab';
import AppearanceTab from '@/components/profile/AppearanceTab';
import SubscriptionTab from '@/components/profile/SubscriptionTab';
import VoiceSettingsTab from '@/components/profile/VoiceSettingsTab';

const Profile = () => {
  const { user, isPremium } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
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
  
  return (
    <Layout showBackButton title="Profile Settings">
      <div className="container py-10 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your profile information and preferences in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Information */}
              <ProfileDetailsTab user={user} />
              
              <Separator />
              
              {/* Appearance Settings */}
              <AppearanceTab 
                selectedTheme={selectedTheme} 
                setSelectedTheme={setSelectedTheme} 
              />
              
              {/* Subscription Details (Premium only) */}
              {isPremium && (
                <>
                  <Separator />
                  <SubscriptionTab />
                </>
              )}
              
              {/* Voice Settings (Premium only) */}
              {isPremium && (
                <>
                  <Separator />
                  <VoiceSettingsTab />
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


import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { user, isPremium, refreshSubscriptionStatus } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  
  // Theme settings
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Voice settings
  const [selectedVoice, setSelectedVoice] = useState(getCurrentVoice().id);
  const [autoReadMessages, setAutoReadMessages] = useState(getAutoReadSetting());
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  // Load avatar URL
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      const timestamp = Date.now(); // Add timestamp to prevent caching
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
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('amaa')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('amaa').getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Force update the avatar URL with timestamp to prevent caching
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
      
      await refreshSubscriptionStatus();
      
      toast.success('Avatar updated successfully!');
      
    } catch (error: any) {
      toast.error(`Error uploading avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const updateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    }
  };
  
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
  
  const saveVoiceSettings = () => {
    setVoice(selectedVoice);
    setAutoReadSetting(autoReadMessages);
    toast.success('Voice settings saved!');
  };
  
  return (
    <Layout showBackButton title="Profile Settings">
      <div className="container py-10 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile information and avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="w-24 h-24 border border-border">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <>
                      <AvatarImage src="/ppp.png" alt="Profile" />
                      <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground px-4 py-2 rounded-md">
                      <Upload size={16} />
                      <span>{uploading ? 'Uploading...' : 'Upload Avatar'}</span>
                      {uploading && <Loader2 className="animate-spin ml-2" size={16} />}
                    </div>
                    <input 
                      id="avatar" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={uploadAvatar}
                      disabled={uploading}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground">Recommended: Square JPG, PNG. Max 4MB.</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="mt-1.5 bg-muted/30"
                />
              </div>
              
              <Button onClick={updateProfile}>Update Profile</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the appearance of the application.</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <SelectItem value="light">Default</SelectItem>
                  <SelectItem value="dark">Default Dark</SelectItem>
                  <SelectItem value="dark-red">Dark Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Subscription Details (Premium only) */}
        {isPremium && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Manage your subscription and billing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <Badge className="bg-teal hover:bg-teal">Premium</Badge>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Next billing</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Voice Settings (Premium only) */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Customize your text-to-speech experience.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Profile;

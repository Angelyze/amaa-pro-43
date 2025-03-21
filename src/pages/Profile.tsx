import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Layout } from '@/components/ui/layout';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Loader2, Upload, User } from 'lucide-react';

const Profile = () => {
  const { user, isPremium, refreshSubscriptionStatus } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('tts_voice') || '9BWtsMINqrJLrRacOk9x';
  });
  const [autoReadMessages, setAutoReadMessages] = useState(() => {
    return localStorage.getItem('auto_read_messages') === 'true';
  });
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  
  const voices = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Calm female voice' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Deep male voice' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Friendly female voice' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Warm female voice' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Casual male voice' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Authoritative male voice' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'British male voice' },
    { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', description: 'Soft female voice' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Energetic male voice' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Refined female voice' }
  ];

  const themes = [
    { id: 'light', name: 'Default' },
    { id: 'dark', name: 'Default Dark' },
  ];
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from('amaa')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('amaa').getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      console.log('Successfully uploaded to storage. Public URL:', data.publicUrl);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });
      
      if (updateError) {
        console.error('User metadata update error:', updateError);
        throw updateError;
      }
      
      setAvatarUrl(data.publicUrl);
      
      toast.success('Avatar updated successfully!');
      
    } catch (error: any) {
      console.error('Complete error details:', error);
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
  
  const saveVoiceSettings = () => {
    localStorage.setItem('tts_voice', selectedVoice);
    localStorage.setItem('auto_read_messages', autoReadMessages.toString());
    toast.success('Voice settings saved!');
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast.success('Theme updated successfully!');
  };
  
  useEffect(() => {
    const savedVoice = localStorage.getItem('tts_voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
    
    const autoRead = localStorage.getItem('auto_read_messages');
    if (autoRead !== null) {
      setAutoReadMessages(autoRead === 'true');
    }
  }, []);
  
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
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <Avatar className="w-24 h-24">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt="Profile" />
                      ) : null}
                      <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
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
          </TabsContent>
          
          {isPremium && (
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the appearance of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
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
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status</span>
                        <Badge className="bg-teal hover:bg-teal">Premium</Badge>
                      </div>
                      
                      {isPremium && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Next billing</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
                          {voices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} - {voice.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">Choose from ElevenLabs high-quality voices.</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-read">Auto-read messages</Label>
                        <p className="text-xs text-muted-foreground">Automatically read incoming messages with text-to-speech</p>
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
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;

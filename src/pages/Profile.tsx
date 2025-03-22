
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/ui/layout';
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
import { 
  getAllVoices,
  setVoice, 
  setAutoReadSetting,
  getCurrentVoice,
  getAutoReadSetting,
  VoiceOption 
} from '@/services/speechService';
import { changeTheme } from '@/themes/main';

const Profile = () => {
  const { user, isPremium, refreshSubscriptionStatus } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  
  // Theme settings
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Voice settings (for premium users)
  const [selectedVoice, setSelectedVoice] = useState(getCurrentVoice().id);
  const [autoReadMessages, setAutoReadMessages] = useState(getAutoReadSetting());
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
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
  
  // Initialize TTS voices for premium users
  useEffect(() => {
    if (isPremium) {
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
    }
  }, [isPremium]);
  
  const uploadAvatar = async () => {
    toast.error("Avatar upload is currently unavailable. Using default avatar.");
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
    changeTheme(theme);
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
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your profile information and preferences in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <Avatar className="w-24 h-24 border border-border">
                    <AvatarImage src="/ppp.png" alt="Profile" />
                    <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground px-4 py-2 rounded-md">
                        <Upload size={16} />
                        <span>Upload Avatar</span>
                      </div>
                      <input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={() => uploadAvatar()}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">Recommended: Square JPG, PNG. Max 4MB.</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="mt-1.5 bg-muted/30"
                  />
                </div>
                
                <Button onClick={updateProfile} className="mt-4">Update Profile</Button>
              </div>
              
              <Separator />
              
              {/* Appearance Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Appearance</h3>
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
                      <SelectItem value="dark-green">Dark Green</SelectItem>
                      <SelectItem value="dark-yellow">Dark Yellow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Subscription Details (Premium only) */}
              {isPremium && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Subscription</h3>
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
                  </div>
                </>
              )}
              
              {/* Voice Settings (Premium only) */}
              {isPremium && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Voice Settings</h3>
                    <div className="space-y-4">
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
                  </div>
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

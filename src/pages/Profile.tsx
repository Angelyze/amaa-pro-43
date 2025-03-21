
import React, { useState } from 'react';
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
import ThemeToggle from '@/components/ThemeToggle';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Loader2, Upload, User } from 'lucide-react';

const Profile = () => {
  const { user, isPremium, refreshSubscriptionStatus } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [autoReadMessages, setAutoReadMessages] = useState(false);
  
  const voices = [
    { id: 'alloy', name: 'Alloy (Neutral)' },
    { id: 'echo', name: 'Echo (Male)' },
    { id: 'fable', name: 'Fable (Male)' },
    { id: 'onyx', name: 'Onyx (Male)' },
    { id: 'nova', name: 'Nova (Female)' },
    { id: 'shimmer', name: 'Shimmer (Female)' }
  ];
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      setAvatarUrl(data.publicUrl);
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
  
  const saveVoiceSettings = () => {
    // Save voice settings to local storage
    localStorage.setItem('tts_voice', selectedVoice);
    localStorage.setItem('auto_read_messages', autoReadMessages.toString());
    toast.success('Voice settings saved!');
  };
  
  return (
    <Layout>
      <div className="container py-10 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isPremium && (
              <>
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
                      <AvatarImage src={avatarUrl} />
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
            
            {isPremium && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the appearance of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="max-w-xs">
                      <ThemeToggle />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
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
                      
                      {/* Display other subscription details if available */}
                      {isPremium && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Next billing</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <Button onClick={() => refreshSubscriptionStatus()}>Refresh Status</Button>
                      <Link to="/subscribe">
                        <Button variant="outline">Manage Subscription</Button>
                      </Link>
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
                              {voice.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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


import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileDetailsTabProps {
  user: any;
  avatarUrl: string;
  userInitials: string;
  refreshSubscriptionStatus: () => Promise<void>;
}

const ProfileDetailsTab = ({ user, avatarUrl, userInitials, refreshSubscriptionStatus }: ProfileDetailsTabProps) => {
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="w-24 h-24">
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
  );
};

export default ProfileDetailsTab;

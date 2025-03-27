
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileDetailsTabProps {
  user: any;
}

const ProfileDetailsTab = ({ user }: ProfileDetailsTabProps) => {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';
  
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
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Profile Information</h3>
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="w-24 h-24 border border-border">
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
  );
};

export default ProfileDetailsTab;

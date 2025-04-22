import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Upload, Edit, Key, Trash2, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ChangePasswordDialog from './ChangePasswordDialog';
import DeleteProfileDialog from './DeleteProfileDialog';

const AVATAR_BUCKET = "avatars";

function getInitials(name?: string, email?: string) {
  if (name) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }
  return email ? email.substring(0, 2).toUpperCase() : 'U';
}

function avatarUrlForUser(user: any) {
  return user?.user_metadata?.avatar_url || user?.avatar_url || null;
}

interface ProfileDetailsTabProps {
  user: any;
}

const ProfileDetailsTab = ({ user }: ProfileDetailsTabProps) => {
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || user?.full_name || ""
  );
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = getInitials(fullName, user?.email);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    avatarUrlForUser(user)
  );

  React.useEffect(() => {
    setAvatarUrl(avatarUrlForUser(user));
  }, [user]);

  async function refreshProfile() {
    toast.info("Please refresh the page to update profile changes.");
  }

  const uploadAvatar = async (file: File) => {
    setIsAvatarUploading(true);
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid image type');
        setIsAvatarUploading(false);
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast.error('Image size should be <= 4MB');
        setIsAvatarUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `profile_${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error('Could not fetch public URL for avatar');

      let { error: userError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated!');
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar.");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);

      toast.success('Profile updated successfully!');
      refreshProfile();
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Profile Information</h3>
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative">
          <Avatar className="w-24 h-24 border border-border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile picture" />
            ) : (
              <AvatarFallback className="text-xl flex flex-col items-center justify-center">
                <Image className="w-6 h-6 mb-2 text-muted-foreground" />
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-0 bottom-0 rounded-full flex items-center"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAvatarUploading}
          >
            {isAvatarUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            <span className="sr-only">Upload new avatar</span>
          </Button>
          <input
            ref={fileInputRef}
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                await uploadAvatar(e.target.files[0]);
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="text-xs">
            <span className="font-medium">Recommended:</span> Square JPG, PNG, Max 4MB
          </div>
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
          autoComplete="off"
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

      <div className="flex gap-2 mt-6 flex-wrap">
        <Button onClick={updateProfile}>
          <Edit className="w-4 h-4 mr-2" />
          Update Profile
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPasswordDialog(true)}
        >
          <Key className="w-4 h-4 mr-2" />
          Change Password
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Profile
        </Button>
      </div>

      <ChangePasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
      <DeleteProfileDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} userId={user?.id} userEmail={user?.email} />
    </div>
  );
};

export default ProfileDetailsTab;

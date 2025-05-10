
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatarUrl: string;
  isUploading: boolean;
  onAvatarChange: (url: string) => void;
  onUpdate: () => Promise<void>;
  userId: string;
}

const EditProfileDialog = ({
  isOpen,
  onOpenChange,
  displayName,
  setDisplayName,
  username,
  setUsername,
  bio,
  setBio,
  avatarUrl,
  isUploading,
  onAvatarChange,
  onUpdate,
  userId
}: EditProfileDialogProps) => {
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [localUsername, setLocalUsername] = useState(username);
  const [localBio, setLocalBio] = useState(bio);
  const [localIsUploading, setLocalIsUploading] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setLocalDisplayName(displayName);
    setLocalUsername(username);
    setLocalBio(bio);
  }, [displayName, username, bio, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    setLocalIsUploading(true);
    
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // First, check if avatars bucket exists
      const { data: buckets } = await supabase
        .storage
        .listBuckets();
      
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarBucketExists) {
        // Create bucket if it doesn't exist
        const { error: bucketError } = await supabase
          .storage
          .createBucket('avatars', {
            public: true
          });
          
        if (bucketError) throw bucketError;
      }
      
      // Upload file
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (publicUrl) {
        onAvatarChange(publicUrl.publicUrl);
        toast.success("Avatar uploaded successfully!");
      }
      
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(`Failed to upload avatar: ${error.message}`);
    } finally {
      setLocalIsUploading(false);
    }
  };

  const handleSave = async () => {
    // Update parent state
    setDisplayName(localDisplayName);
    setUsername(localUsername);
    setBio(localBio);
    
    // Call the update function
    await onUpdate();
    
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-dream-purple/20">
                {username ? username[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-dream-purple">
                {isUploading || localIsUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    <span>Change Photo</span>
                  </>
                )}
              </div>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading || localIsUploading}
              />
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={localDisplayName}
              onChange={(e) => setLocalDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={localBio}
              onChange={(e) => setLocalBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-dream-lavender to-dream-purple"
            disabled={isUploading || localIsUploading}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;

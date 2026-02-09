
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "./ProfileAvatar";
import SymbolAvatarPickerDialog from "./SymbolAvatarPickerDialog";

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatarSymbol: string | null;
  avatarColor: string | null;
  setAvatarSymbol: (symbol: string) => void;
  setAvatarColor: (color: string) => void;
  handleUpdateProfile: () => void;
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
  avatarSymbol,
  avatarColor,
  setAvatarSymbol,
  setAvatarColor,
  handleUpdateProfile,
}: EditProfileDialogProps) => {
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false);

  const handleSymbolSave = (symbol: string, color: string) => {
    setAvatarSymbol(symbol);
    setAvatarColor(color);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="gradient-text text-white">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <ProfileAvatar
              avatarSymbol={avatarSymbol}
              avatarColor={avatarColor}
              username={username}
              isOwnProfile={true}
              onEdit={() => setSymbolPickerOpen(true)}
            />
            <Button variant="secondary" size="sm" onClick={() => setSymbolPickerOpen(true)}>
              Change Symbol & Color
            </Button>
            <SymbolAvatarPickerDialog
              isOpen={symbolPickerOpen}
              onOpenChange={setSymbolPickerOpen}
              avatarSymbol={avatarSymbol}
              avatarColor={avatarColor}
              onSave={handleSymbolSave}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-white">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="glass-button">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile}
            className="glass-button"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;

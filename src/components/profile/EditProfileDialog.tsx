
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "./ProfileAvatar";
import SymbolAvatarPickerDialog from "./SymbolAvatarPickerDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

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
  avatarUrl: string | null;
  setAvatarSymbol: (symbol: string) => void;
  setAvatarColor: (color: string) => void;
  setAvatarUrl: (url: string | null) => void;
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
  avatarUrl,
  setAvatarSymbol,
  setAvatarColor,
  setAvatarUrl,
  handleUpdateProfile,
}: EditProfileDialogProps) => {
  const { user } = useAuth();
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false);
  const [dreamAvatarUrl, setDreamAvatarUrl] = useState<string | null>(null);
  // "symbol" = using the symbol avatar, "dream" = using the dream avatar photo
  const [selectedAvatarType, setSelectedAvatarType] = useState<"symbol" | "dream">(
    avatarUrl ? "dream" : "symbol"
  );

  // Load the user's saved Dream Avatar from ai_context
  useEffect(() => {
    if (isOpen && user) {
      supabase
        .from("ai_context")
        .select("photo_url")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.photo_url) setDreamAvatarUrl(data.photo_url);
        });
    }
  }, [isOpen, user]);

  // Sync selectedAvatarType with avatarUrl prop
  useEffect(() => {
    setSelectedAvatarType(avatarUrl ? "dream" : "symbol");
  }, [avatarUrl]);

  const handleSymbolSave = (symbol: string, color: string) => {
    setAvatarSymbol(symbol);
    setAvatarColor(color);
  };

  const handleSelectSymbol = () => {
    setSelectedAvatarType("symbol");
    setAvatarUrl(null);
  };

  const handleSelectDreamAvatar = () => {
    if (dreamAvatarUrl) {
      setSelectedAvatarType("dream");
      setAvatarUrl(dreamAvatarUrl);
    }
  };

  const currentAvatarUrl = selectedAvatarType === "dream" ? dreamAvatarUrl : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md glass-card border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* Avatar Selector */}
          <div className="space-y-3">
            <Label className="text-white/80 text-sm">Profile Picture</Label>
            <div className="flex gap-4 justify-center">
              {/* Symbol Avatar Option */}
              <button
                type="button"
                onClick={handleSelectSymbol}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  selectedAvatarType === "symbol"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="relative">
                  <ProfileAvatar
                    avatarSymbol={avatarSymbol}
                    avatarColor={avatarColor}
                    avatarUrl={null}
                    username={username}
                    isOwnProfile={false}
                    onEdit={() => {}}
                  />
                  {selectedAvatarType === "symbol" && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-primary fill-background" />
                  )}
                </div>
                <span className="text-xs text-white/70">Symbol</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={(e) => { e.stopPropagation(); setSymbolPickerOpen(true); }}
                  className="text-xs text-primary h-6"
                >
                  Change
                </Button>
              </button>

              {/* Dream Avatar Option */}
              <button
                type="button"
                onClick={handleSelectDreamAvatar}
                disabled={!dreamAvatarUrl}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  !dreamAvatarUrl && "opacity-40 cursor-not-allowed",
                  selectedAvatarType === "dream" && dreamAvatarUrl
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="relative">
                  {dreamAvatarUrl ? (
                    <>
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-dream-lavender shadow-lg">
                        <img src={dreamAvatarUrl} alt="Dream Avatar" className="w-full h-full object-cover" />
                      </div>
                      {selectedAvatarType === "dream" && (
                        <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-primary fill-background" />
                      )}
                    </>
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center">
                      <span className="text-white/30 text-xs text-center px-2">No Dream Avatar</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-white/70">Dream Avatar</span>
                {!dreamAvatarUrl && (
                  <span className="text-[10px] text-muted-foreground text-center">Set one in your Avatar settings</span>
                )}
              </button>
            </div>
          </div>

          <SymbolAvatarPickerDialog
            isOpen={symbolPickerOpen}
            onOpenChange={setSymbolPickerOpen}
            avatarSymbol={avatarSymbol}
            avatarColor={avatarColor}
            onSave={handleSymbolSave}
          />

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
          <Button onClick={handleUpdateProfile} className="glass-button">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;

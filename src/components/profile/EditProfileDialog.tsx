
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProfileAvatar from "./ProfileAvatar";
import SymbolAvatarPickerDialog from "./SymbolAvatarPickerDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowLeft, Instagram, Facebook, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SocialLinks {
  twitter: string;
  instagram: string;
  facebook: string;
  website: string;
}

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
  socialLinks?: SocialLinks;
  setSocialLinks?: (value: SocialLinks) => void;
  handleUpdateSocialLinks?: () => void;
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
  socialLinks,
  setSocialLinks,
  handleUpdateSocialLinks,
}: EditProfileDialogProps) => {
  const { user } = useAuth();
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false);
  const [dreamAvatarUrl, setDreamAvatarUrl] = useState<string | null>(null);
  const [selectedAvatarType, setSelectedAvatarType] = useState<"symbol" | "dream">(
    avatarUrl ? "dream" : "symbol"
  );

  useEffect(() => {
    if (isOpen && user) {
      supabase
        .from("dream_characters")
        .select("photo_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.photo_url) setDreamAvatarUrl(data.photo_url);
          else {
            supabase
              .from("ai_context")
              .select("photo_url")
              .eq("user_id", user.id)
              .maybeSingle()
              .then(({ data: aiData }) => {
                if (aiData?.photo_url) setDreamAvatarUrl(aiData.photo_url);
              });
          }
        });
    }
  }, [isOpen, user]);

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

  const handleSave = () => {
    handleUpdateProfile();
    if (handleUpdateSocialLinks) handleUpdateSocialLinks();
    onOpenChange(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-base font-semibold text-foreground">Edit Profile</h1>
              <div className="w-10" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Banner gradient */}
              <div className="h-24 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />

              <div className="px-6 -mt-12 pb-28 space-y-8">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <div className="flex gap-5 justify-center">
                    {/* Symbol Avatar Option */}
                    <button
                      type="button"
                      onClick={handleSelectSymbol}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        selectedAvatarType === "symbol"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/30"
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
                          <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-primary fill-background" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Symbol</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSymbolPickerOpen(true); }}
                        className="text-xs text-primary h-7"
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
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="relative">
                        {dreamAvatarUrl ? (
                          <>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
                              <img src={dreamAvatarUrl} alt="Dream Avatar" className="w-full h-full object-cover" />
                            </div>
                            {selectedAvatarType === "dream" && (
                              <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-primary fill-background" />
                            )}
                          </>
                        ) : (
                          <div className="w-24 h-24 rounded-full border-4 border-dashed border-border flex items-center justify-center">
                            <span className="text-muted-foreground text-xs text-center px-2">No Dream Avatar</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Dream Avatar</span>
                      {!dreamAvatarUrl && (
                        <span className="text-[10px] text-muted-foreground text-center">Set in Avatar settings</span>
                      )}
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Personal Info */}
                <div className="space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Info</h3>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-foreground text-sm">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground text-sm">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={3}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                </div>

                {/* Social Links - merged inline */}
                {socialLinks && setSocialLinks && (
                  <>
                    <Separator />
                    <div className="space-y-5">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Social Links</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitter" className="flex items-center gap-2 text-foreground text-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            X (Twitter)
                          </Label>
                          <Input
                            id="twitter"
                            value={socialLinks.twitter}
                            onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                            placeholder="username"
                            className="bg-muted/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram" className="flex items-center gap-2 text-foreground text-sm">
                            <Instagram size={14} className="text-pink-500" />
                            Instagram
                          </Label>
                          <Input
                            id="instagram"
                            value={socialLinks.instagram}
                            onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                            placeholder="username"
                            className="bg-muted/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facebook" className="flex items-center gap-2 text-foreground text-sm">
                            <Facebook size={14} className="text-blue-600" />
                            Facebook
                          </Label>
                          <Input
                            id="facebook"
                            value={socialLinks.facebook}
                            onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                            placeholder="username"
                            className="bg-muted/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website" className="flex items-center gap-2 text-foreground text-sm">
                            <Globe size={14} />
                            Website
                          </Label>
                          <Input
                            id="website"
                            value={socialLinks.website}
                            onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                            placeholder="https://yourwebsite.com"
                            className="bg-muted/50 border-border"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sticky save bar */}
            <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}>
              <Button onClick={handleSave} className="w-full h-12 text-base font-semibold">
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SymbolAvatarPickerDialog
        isOpen={symbolPickerOpen}
        onOpenChange={setSymbolPickerOpen}
        avatarSymbol={avatarSymbol}
        avatarColor={avatarColor}
        onSave={handleSymbolSave}
      />
    </>
  );
};

export default EditProfileDialog;

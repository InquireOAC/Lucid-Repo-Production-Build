import React, { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { Camera, Trash2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import NotificationBell from "@/components/notifications/NotificationBell";
import ProfileAvatar from "./ProfileAvatar";
import ProfileHeaderActions from "./ProfileHeaderActions";
import ProfileSocialLinks from "./ProfileSocialLinks";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  heroDreamImageUrl?: string | null;
  onEditProfileClick: () => void;
  onMessageClick: () => void;
  onSettingsClick: () => void;
  onSubscriptionClick: () => void;
  onFollowClick: () => void;
  onStartConversation: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  onSocialLinksEdit: () => void;
}

const ProfileHeader = ({
  profile,
  isOwnProfile,
  dreamCount,
  followersCount,
  followingCount,
  isFollowing,
  heroDreamImageUrl,
  onEditProfileClick,
  onMessageClick,
  onSettingsClick,
  onSubscriptionClick,
  onFollowClick,
  onStartConversation,
  onFollowersClick,
  onFollowingClick,
  onSocialLinksEdit,
}: ProfileHeaderProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(
    profile?.banner_image || null,
  );

  useEffect(() => {
    setBannerImage(profile?.banner_image || null);
  }, [profile?.banner_image]);

  // Hero source priority: dream image → uploaded banner → gradient fallback
  const heroSrc = heroDreamImageUrl || bannerImage;
  const joinDate = profile?.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/banner.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-banners")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload banner image");
      console.error(uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-banners")
      .getPublicUrl(path);

    const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ banner_image: url } as any)
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to save banner");
      console.error(updateError);
      return;
    }

    toast.success("Banner updated!");
    setBannerImage(url);
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (!user) return;
    await supabase.storage
      .from("profile-banners")
      .remove([
        `${user.id}/banner.jpg`,
        `${user.id}/banner.png`,
        `${user.id}/banner.jpeg`,
        `${user.id}/banner.webp`,
      ]);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ banner_image: null } as any)
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to remove banner");
      console.error(updateError);
      return;
    }

    toast.success("Banner removed");
    setBannerImage(null);
  };

  return (
    <div className="relative">
      {/* ─── Cinematic Hero ───────────────────────────────────── */}
      <div className="relative h-56 sm:h-72 md:h-80 lg:h-[420px] xl:h-[480px] 2xl:h-[520px] w-full overflow-hidden">
        {heroSrc ? (
          <img
            src={heroSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/20 to-background" />
        )}

        {/* Top fade for nav/status */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/70 to-transparent pointer-events-none" />
        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

        {/* Banner edit button — top-right, own profile only */}
        {isOwnProfile && (
          <>
            <div className="absolute top-3 right-3 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/70 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50">
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change banner
                  </DropdownMenuItem>
                  {bannerImage && (
                    <DropdownMenuItem
                      onClick={handleRemove}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove banner
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}

        {/* Identity overlay — bottom of hero */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 lg:px-12 lg:pb-8 xl:px-16 xl:pb-10 z-10">
          <div className="flex items-end justify-between gap-3 lg:gap-6">
            {/* Left: avatar + name + handle + bio */}
            <div className="flex items-end gap-3 lg:gap-5 min-w-0">
              <div className="flex-shrink-0 lg:scale-125 xl:scale-150 origin-bottom-left">
                <ProfileAvatar
                  avatarSymbol={profile?.avatar_symbol}
                  avatarColor={profile?.avatar_color}
                  avatarUrl={profile?.avatar_url}
                  username={profile?.username}
                  isOwnProfile={isOwnProfile}
                  onEdit={onEditProfileClick}
                />
              </div>
              <div className="min-w-0 pb-1 lg:pb-2 xl:pb-4">
                <h1 className="text-lg sm:text-xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
                  {profile?.display_name || profile?.username || "Unknown User"}
                </h1>
                {profile?.username && (
                  <p className="text-xs lg:text-sm xl:text-base text-white/70 truncate">
                    @{profile.username}
                  </p>
                )}
                {profile?.bio && (
                  <p className="text-xs lg:text-base xl:text-lg text-white/70 line-clamp-2 lg:line-clamp-3 mt-1 lg:mt-2 drop-shadow">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 pb-1 lg:pb-2">
              <ProfileHeaderActions
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
                onFollowClick={onFollowClick}
                onMessageClick={onMessageClick}
                onSettingsClick={onSettingsClick}
                onSubscriptionClick={onSubscriptionClick}
                onFollowersClick={onFollowersClick}
                onFollowingClick={onFollowingClick}
                followersCount={followersCount}
                followingCount={followingCount}
              />
              {isOwnProfile && <NotificationBell />}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Below-hero info strip ───────────────────────────── */}
      <div className="px-4 pt-3 pb-4 lg:px-12 lg:pt-6 lg:pb-8 xl:px-16">
        {/* Stats row */}
        <div className="flex gap-5 lg:gap-10 text-sm lg:text-base">
          <button onClick={onFollowingClick} className="hover:underline">
            <span className="font-bold">{followingCount}</span>
            <span className="text-muted-foreground ml-1">Following</span>
          </button>
          <button onClick={onFollowersClick} className="hover:underline">
            <span className="font-bold">{followersCount}</span>
            <span className="text-muted-foreground ml-1">Followers</span>
          </button>
          <div>
            <span className="font-bold">{dreamCount}</span>
            <span className="text-muted-foreground ml-1">Dreams</span>
          </div>
        </div>

        {/* Social links */}
        <div className="mt-3 lg:mt-5">
          <ProfileSocialLinks
            socialLinks={profile?.social_links}
            isOwnProfile={isOwnProfile}
            onEdit={onSocialLinksEdit}
          />
        </div>

        {/* Join date */}
        {joinDate && (
          <div className="flex items-center gap-1 lg:gap-1.5 mt-3 lg:mt-5 text-xs lg:text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            <span>Joined {joinDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

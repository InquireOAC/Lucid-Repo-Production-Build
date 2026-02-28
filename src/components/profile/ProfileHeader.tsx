import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import ProfileAvatar from "./ProfileAvatar";
import ProfileHeaderActions from "./ProfileHeaderActions";
import ProfileSocialLinks from "./ProfileSocialLinks";
import ProfileBanner from "./ProfileBanner";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
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
  onEditProfileClick,
  onMessageClick,
  onSettingsClick,
  onSubscriptionClick,
  onFollowClick,
  onStartConversation,
  onFollowersClick,
  onFollowingClick,
  onSocialLinksEdit
}: ProfileHeaderProps) => {
  const joinDate = profile?.created_at ? format(new Date(profile.created_at), "MMM yyyy") : null;
  const [bannerImage, setBannerImage] = React.useState<string | null>(profile?.banner_image || null);

  React.useEffect(() => {
    setBannerImage(profile?.banner_image || null);
  }, [profile?.banner_image]);

  return (
    <div className="relative">
      {/* Banner */}
      <ProfileBanner
        bannerImage={bannerImage}
        isOwnProfile={isOwnProfile}
        onBannerUpdated={(url) => setBannerImage(url)}
        onBannerRemoved={() => setBannerImage(null)}
      />
      
      {/* Profile Content - X/Twitter style */}
      <div className="px-4 pb-4">
        {/* Avatar and action buttons row */}
        <div className="flex justify-between items-start">
          {/* Avatar - overlapping banner */}
          <div className="relative -mt-12 z-10">
            <div className="ring-4 ring-background rounded-full bg-background">
              <ProfileAvatar
                avatarSymbol={profile?.avatar_symbol}
                avatarColor={profile?.avatar_color}
                avatarUrl={profile?.avatar_url}
                username={profile?.username}
                isOwnProfile={isOwnProfile}
                onEdit={onEditProfileClick}
              />
            </div>
          </div>
          
          {/* Action buttons - below banner */}
          <div className="flex flex-col items-end gap-2 pt-3">
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

        {/* Name & Username */}
        <div className="mb-3">
          <h1 className="text-xl font-bold">
            {profile?.display_name || profile?.username || "Unknown User"}
          </h1>
          {profile?.username && (
            <p className="text-muted-foreground">@{profile.username}</p>
          )}
        </div>
        
        {/* Bio */}
        {profile?.bio && (
          <p className="text-sm mb-3">{profile.bio}</p>
        )}

        {/* Meta info row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
          {joinDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinDate}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        <ProfileSocialLinks
          socialLinks={profile?.social_links}
          isOwnProfile={isOwnProfile}
          onEdit={onSocialLinksEdit}
        />

        {/* Stats Row */}
        <div className="flex gap-4 text-sm mt-3">
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
      </div>
    </div>
  );
};

export default ProfileHeader;

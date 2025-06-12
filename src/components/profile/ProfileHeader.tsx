
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
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
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="relative mb-4">
        <ProfileAvatar
          avatarSymbol={profile?.avatar_symbol}
          avatarColor={profile?.avatar_color}
          username={profile?.username}
          isOwnProfile={isOwnProfile}
          onEdit={onEditProfileClick}
        />
      </div>

      <h1 className="text-2xl font-bold mb-2">
        {profile?.display_name || profile?.username || "Unknown User"}
      </h1>
      
      {profile?.username && (
        <p className="text-muted-foreground mb-2">@{profile.username}</p>
      )}
      
      {profile?.bio && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">{profile.bio}</p>
      )}

      <ProfileSocialLinks
        socialLinks={profile?.social_links}
        isOwnProfile={isOwnProfile}
        onEdit={onSocialLinksEdit}
      />

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
    </div>
  );
};

export default ProfileHeader;

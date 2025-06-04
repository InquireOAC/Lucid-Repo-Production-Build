
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileHeaderActions from "./ProfileHeaderActions";

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
  onFollowingClick
}: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="relative mb-4">
        <ProfileAvatar
          profile={profile}
          size="lg"
          className="w-24 h-24"
        />
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditProfileClick}
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
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

      <div className="text-sm text-muted-foreground mb-4">
        {dreamCount} dreams shared
      </div>

      <ProfileHeaderActions
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowClick={onFollowClick}
        onMessageClick={onStartConversation}
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

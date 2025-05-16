
import React from "react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileSocialLinks from "./ProfileSocialLinks";
import ProfileStatsBar from "./ProfileStatsBar";
import ProfileHeaderActions from "./ProfileHeaderActions";
import { useDirectConversation } from "@/hooks/useDirectConversation";

interface ProfileHeaderProps {
  profileToShow: any;
  isOwnProfile: boolean;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  setIsMessagesOpen: (value: boolean) => void;
  setIsSettingsOpen: (value: boolean) => void;
  setIsSocialLinksOpen: (value: boolean) => void;
  handleFollow: () => void;
  handleStartConversation: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfileHeader = ({
  profileToShow,
  isOwnProfile,
  dreamCount,
  followersCount,
  followingCount,
  isFollowing,
  setIsEditProfileOpen,
  setIsMessagesOpen,
  setIsSettingsOpen,
  setIsSocialLinksOpen,
  handleFollow,
  handleStartConversation,
  onFollowersClick,
  onFollowingClick
}: ProfileHeaderProps) => {
  const myId = profileToShow?.viewer_id || null;
  const theirId = profileToShow?.id || null;
  const { openChatWithUser, loading } = useDirectConversation(myId, theirId);

  const onMessageOtherUser = () => {
    if (isOwnProfile) {
      setIsMessagesOpen(true);
      return;
    }
    // Always open or start a chat on message, then open dialog
    openChatWithUser(() => setIsMessagesOpen(true));
  };

  return (
    <div className="flex flex-col items-center mb-6 pt-4">
      <ProfileAvatar
        avatarUrl={profileToShow?.avatar_url}
        username={profileToShow?.username}
        isOwnProfile={isOwnProfile}
        onEdit={() => setIsEditProfileOpen(true)}
      />
      <h1 className="text-xl font-bold mt-3">
        {profileToShow?.display_name || profileToShow?.username || "New Dreamer"}
      </h1>
      <p className="text-sm text-muted-foreground">@{profileToShow?.username || "username"}</p>
      {profileToShow?.bio && (
        <p className="text-sm text-center mt-2 max-w-md">{profileToShow.bio}</p>
      )}

      <ProfileSocialLinks 
        socialLinks={profileToShow?.social_links}
        isOwnProfile={isOwnProfile}
        onEdit={() => setIsSocialLinksOpen(true)}
      />

      <ProfileStatsBar
        dreamCount={dreamCount}
        followersCount={followersCount}
        followingCount={followingCount}
        onFollowersClick={onFollowersClick}
        onFollowingClick={onFollowingClick}
      />
      <div className="flex gap-2 mt-4">
        <ProfileHeaderActions
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onMessages={onMessageOtherUser}
          onSettings={() => setIsSettingsOpen(true)}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;

import React from "react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileSocialLinks from "./ProfileSocialLinks";
import ProfileStatsBar from "./ProfileStatsBar";
import ProfileHeaderActions from "./ProfileHeaderActions";
import { useDirectConversation } from "@/hooks/useDirectConversation";
import { useAuth } from "@/contexts/AuthContext";

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
  setIsSubscriptionOpen: (value: boolean) => void;
  handleFollow: () => void;
  handleStartConversation: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  setSelectedConversationUser: (user: any) => void;
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
  setIsSubscriptionOpen,
  handleFollow,
  handleStartConversation,
  onFollowersClick,
  onFollowingClick,
  setSelectedConversationUser
}: ProfileHeaderProps) => {
  // Always get the currently authenticated user (not the viewed profile)
  const { user } = useAuth();
  const myId = user?.id || null;
  const theirId = profileToShow?.id || null;
  const { openChatWithUser, loading } = useDirectConversation(myId, theirId);

  // Always open or start a chat on message button click
  const onMessageOtherUser = () => {
    console.log("[ProfileHeader] Message btn clicked. isOwnProfile:", isOwnProfile, { myId, theirId });
    if (isOwnProfile) {
      setIsMessagesOpen(true);
      return;
    }
    // Only start DM if logged in
    if (!myId || !theirId) {
      console.warn("Cannot start DM: missing myId or theirId", { myId, theirId });
      return;
    }
    // Always open/prepare a DM and open dialog
    openChatWithUser((profile) => {
      console.log("[ProfileHeader] openChatWithUser callback executed: opening messages dialog with", profile);
      setSelectedConversationUser(profile);
      setIsMessagesOpen(true);
    });
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
          onMessages={() => {
            console.log("[ProfileHeaderActions] onMessages prop called");
            onMessageOtherUser();
          }}
          onSettings={() => setIsSettingsOpen(true)}
          onSubscription={() => setIsSubscriptionOpen(true)}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;

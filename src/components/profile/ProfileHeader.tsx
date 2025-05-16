import React from "react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileSocialLinks from "./ProfileSocialLinks";
import ProfileStatsBar from "./ProfileStatsBar";
import ProfileHeaderActions from "./ProfileHeaderActions";
import { useDirectConversation } from "@/hooks/useDirectConversation";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionDialog from "./SubscriptionDialog";
import { useState } from "react";

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
  const { user } = useAuth();
  const myId = user?.id || null;
  const theirId = profileToShow?.id || null;
  const { openChatWithUser, loading } = useDirectConversation(myId, theirId);
  const [isSubscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const onMessageOtherUser = () => {
    console.log("[ProfileHeader] Message btn clicked. isOwnProfile:", isOwnProfile, { myId, theirId });
    if (isOwnProfile) {
      setIsMessagesOpen(true);
      return;
    }
    if (!myId || !theirId) {
      console.warn("Cannot start DM: missing myId or theirId", { myId, theirId });
      return;
    }
    openChatWithUser((profile) => {
      console.log("[ProfileHeader] openChatWithUser callback executed: opening messages dialog with", profile);
      setSelectedConversationUser(profile);
      setIsMessagesOpen(true);
    });
  };

  const handleOpenSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      setTimeout(() => setSubscriptionDialogOpen(true), 150);
    } catch (error) {
      console.error("Subscription error", error);
    } finally {
      setTimeout(() => setSubscriptionLoading(false), 300);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6 pt-4">
      <ProfileAvatar
        avatarSymbol={profileToShow?.avatar_symbol}
        avatarColor={profileToShow?.avatar_color}
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
      <div className="flex gap-2 mt-4 z-20 relative">
        <ProfileHeaderActions
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onMessages={() => {
            console.log("[ProfileHeaderActions] onMessages prop called");
            onMessageOtherUser();
          }}
          onSettings={() => setIsSettingsOpen(true)}
          onSubscription={handleOpenSubscription}
          loading={subscriptionLoading}
        />
      </div>
      <SubscriptionDialog
        isOpen={isSubscriptionDialogOpen}
        onOpenChange={(open: boolean) => {
          setSubscriptionDialogOpen(open);
          setSubscriptionLoading(false);
        }}
        subscription={null}
      />
    </div>
  );
};

export default ProfileHeader;

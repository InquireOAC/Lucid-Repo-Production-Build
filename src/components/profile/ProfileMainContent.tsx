
import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileDialogs from "./ProfileDialogs";
import FollowersModal from "./FollowersModal";

interface ProfileMainContentProps {
  profileToShow: any;
  isOwnProfile: boolean;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  setIsMessagesOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsSocialLinksOpen: (open: boolean) => void;
  setIsSubscriptionOpen: (open: boolean) => void;
  handleFollow: () => void;
  handleStartConversation: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  publicDreams: any[];
  likedDreams: any[];
  refreshDreams: () => void;
  isEditProfileOpen: boolean;
  isSocialLinksOpen: boolean;
  isSettingsOpen: boolean;
  isMessagesOpen: boolean;
  isSubscriptionOpen: boolean;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatarSymbol: string | null;
  setAvatarSymbol: (value: string) => void;
  avatarColor: string | null;
  setAvatarColor: (value: string) => void;
  handleUpdateProfile: () => void;
  userId?: string;
  socialLinks: any;
  setSocialLinks: (value: any) => void;
  handleUpdateSocialLinks: () => void;
  handleSignOut: () => void;
  conversations: any[];
  subscription: any;
  followers: any[];
  following: any[];
  showFollowers: boolean;
  setShowFollowers: (show: boolean) => void;
  showFollowing: boolean;
  setShowFollowing: (show: boolean) => void;
  selectedConversationUser?: any;
  setSelectedConversationUser?: (user: any) => void;
  fetchConversations?: () => void;
}

const ProfileMainContent = ({
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
  publicDreams,
  likedDreams,
  refreshDreams,
  isEditProfileOpen,
  isSocialLinksOpen,
  isSettingsOpen,
  isMessagesOpen,
  isSubscriptionOpen,
  isNotificationsOpen,
  setIsNotificationsOpen,
  displayName,
  setDisplayName,
  username,
  setUsername,
  bio,
  setBio,
  avatarSymbol,
  setAvatarSymbol,
  avatarColor,
  setAvatarColor,
  handleUpdateProfile,
  userId,
  socialLinks,
  setSocialLinks,
  handleUpdateSocialLinks,
  handleSignOut,
  conversations,
  subscription,
  followers,
  following,
  showFollowers,
  setShowFollowers,
  showFollowing,
  setShowFollowing,
  selectedConversationUser,
  setSelectedConversationUser,
  fetchConversations,
}: ProfileMainContentProps) => {
  return (
    <>
      <ProfileHeader
        profile={profileToShow}
        isOwnProfile={isOwnProfile}
        dreamCount={dreamCount}
        followersCount={followersCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        onEditProfileClick={() => setIsEditProfileOpen(true)}
        onMessageClick={handleStartConversation}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSubscriptionClick={() => setIsSubscriptionOpen(true)}
        onFollowClick={handleFollow}
        onStartConversation={handleStartConversation}
        onFollowersClick={() => {
          setShowFollowers(true);
          onFollowersClick();
        }}
        onFollowingClick={() => {
          setShowFollowing(true);
          onFollowingClick();
        }}
        onSocialLinksEdit={() => setIsSocialLinksOpen(true)}
      />

      <ProfileTabs
        isOwnProfile={isOwnProfile}
        publicDreams={publicDreams}
        likedDreams={likedDreams}
        refreshDreams={refreshDreams}
      />

      <ProfileDialogs
        isEditProfileOpen={isEditProfileOpen}
        setIsEditProfileOpen={setIsEditProfileOpen}
        isSocialLinksOpen={isSocialLinksOpen}
        setIsSocialLinksOpen={setIsSocialLinksOpen}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isMessagesOpen={isMessagesOpen}
        setIsMessagesOpen={setIsMessagesOpen}
        isSubscriptionOpen={isSubscriptionOpen}
        setIsSubscriptionOpen={setIsSubscriptionOpen}
        isNotificationsOpen={isNotificationsOpen}
        setIsNotificationsOpen={setIsNotificationsOpen}
        displayName={displayName}
        setDisplayName={setDisplayName}
        username={username}
        setUsername={setUsername}
        bio={bio}
        setBio={setBio}
        avatarSymbol={avatarSymbol}
        setAvatarSymbol={setAvatarSymbol}
        avatarColor={avatarColor}
        setAvatarColor={setAvatarColor}
        handleUpdateProfile={handleUpdateProfile}
        userId={userId}
        socialLinks={socialLinks}
        setSocialLinks={setSocialLinks}
        handleUpdateSocialLinks={handleUpdateSocialLinks}
        handleSignOut={handleSignOut}
        conversations={conversations}
        subscription={subscription}
        followers={followers}
        following={following}
        showFollowers={showFollowers}
        setShowFollowers={setShowFollowers}
        showFollowing={showFollowing}
        setShowFollowing={setShowFollowing}
        selectedConversationUser={selectedConversationUser}
        setSelectedConversationUser={setSelectedConversationUser}
        fetchConversations={fetchConversations}
      />

      {/* Followers Modal */}
      <FollowersModal
        title="Followers"
        open={showFollowers}
        onOpenChange={setShowFollowers}
        users={followers}
      />

      {/* Following Modal */}
      <FollowersModal
        title="Following"
        open={showFollowing}
        onOpenChange={setShowFollowing}
        users={following}
      />
    </>
  );
};

export default ProfileMainContent;

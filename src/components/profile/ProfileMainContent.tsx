
import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileDialogs from "./ProfileDialogs";

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
  displayName: string;
  setDisplayName: (name: string) => void;
  username: string;
  setUsername: (username: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  avatarSymbol: string;
  setAvatarSymbol: (symbol: string) => void;
  avatarColor: string;
  setAvatarColor: (color: string) => void;
  handleUpdateProfile: () => void;
  userId?: string;
  socialLinks: any;
  setSocialLinks: (links: any) => void;
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
  setShowFollowing
}: ProfileMainContentProps) => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ProfileHeader
          profile={profileToShow}
          isOwnProfile={isOwnProfile}
          dreamCount={dreamCount}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
          onEditProfileClick={() => setIsEditProfileOpen(true)}
          onMessageClick={() => setIsMessagesOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onSubscriptionClick={() => setIsSubscriptionOpen(true)}
          onFollowClick={handleFollow}
          onStartConversation={handleStartConversation}
          onFollowersClick={onFollowersClick}
          onFollowingClick={onFollowingClick}
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
        />
      </div>
    </div>
  );
};

export default ProfileMainContent;

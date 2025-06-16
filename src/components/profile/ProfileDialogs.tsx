
import React from "react";
import EditProfileDialog from "./EditProfileDialog";
import SocialLinksDialog from "./SocialLinksDialog";
import SettingsDialog from "./SettingsDialog";
import MessagesDialog from "./MessagesDialog";
import SubscriptionDialog from "./SubscriptionDialog";
import EnhancedNotificationsDialog from "./EnhancedNotificationsDialog";

interface ProfileDialogsProps {
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (v: boolean) => void;
  isSocialLinksOpen: boolean;
  setIsSocialLinksOpen: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  isMessagesOpen: boolean;
  setIsMessagesOpen: (v: boolean) => void;
  isSubscriptionOpen: boolean;
  setIsSubscriptionOpen: (v: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (v: boolean) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  avatarSymbol: string | null;
  setAvatarSymbol: (v: string) => void;
  avatarColor: string | null;
  setAvatarColor: (v: string) => void;
  handleUpdateProfile: () => void;
  userId?: string;
  socialLinks: any;
  setSocialLinks: (v: any) => void;
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

const ProfileDialogs = ({
  isEditProfileOpen,
  setIsEditProfileOpen,
  isSocialLinksOpen,
  setIsSocialLinksOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  isMessagesOpen,
  setIsMessagesOpen,
  isSubscriptionOpen,
  setIsSubscriptionOpen,
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
  setShowFollowing
}: ProfileDialogsProps) => (
  <>
    <EditProfileDialog
      isOpen={isEditProfileOpen}
      onOpenChange={setIsEditProfileOpen}
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
    />
    <SocialLinksDialog
      isOpen={isSocialLinksOpen}
      onOpenChange={setIsSocialLinksOpen}
      socialLinks={socialLinks}
      setSocialLinks={setSocialLinks}
      handleUpdateSocialLinks={handleUpdateSocialLinks}
    />
    <SettingsDialog
      open={isSettingsOpen}
      onOpenChange={setIsSettingsOpen}
      onSignOut={handleSignOut}
      onNotificationsClick={() => {
        setIsSettingsOpen(false);
        setIsNotificationsOpen(true);
      }}
      socialLinks={socialLinks}
      setSocialLinks={setSocialLinks}
      handleUpdateSocialLinks={handleUpdateSocialLinks}
    />
    <MessagesDialog
      isOpen={isMessagesOpen}
      onOpenChange={setIsMessagesOpen}
      conversations={conversations}
      fetchConversations={() => {}}
    />
    <SubscriptionDialog
      isOpen={isSubscriptionOpen}
      onOpenChange={setIsSubscriptionOpen}
      subscription={subscription}
    />
    <EnhancedNotificationsDialog
      isOpen={isNotificationsOpen}
      onOpenChange={setIsNotificationsOpen}
    />
  </>
);

export default ProfileDialogs;

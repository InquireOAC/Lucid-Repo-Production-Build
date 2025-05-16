import React from "react";
import EditProfileDialog from "./EditProfileDialog";
import SocialLinksDialog from "./SocialLinksDialog";
import SettingsDialog from "./SettingsDialog";
import MessagesDialog from "./MessagesDialog";
import SubscriptionDialog from "./SubscriptionDialog";
import NotificationsDialog from "./NotificationsDialog";

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
  avatarUrl: string;
  handleAvatarChange: (url: string) => void;
  handleUpdateProfile: () => void;
  userId: string;
  socialLinks: any;
  setSocialLinks: (v: any) => void;
  handleUpdateSocialLinks: () => void;
  handleSignOut: () => void;
  conversations: any[];
  subscription: any;
  selectedConversationUser: any;
  setSelectedConversationUser: (v: any) => void;
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
  avatarUrl,
  handleAvatarChange,
  handleUpdateProfile,
  userId,
  socialLinks,
  setSocialLinks,
  handleUpdateSocialLinks,
  handleSignOut,
  conversations,
  subscription,
  selectedConversationUser,
  setSelectedConversationUser,
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
      avatarUrl={avatarUrl}
      isUploading={false}
      handleAvatarChange={handleAvatarChange}
      handleUpdateProfile={handleUpdateProfile}
      userId={userId}
    />
    <SocialLinksDialog
      isOpen={isSocialLinksOpen}
      onOpenChange={setIsSocialLinksOpen}
      socialLinks={socialLinks}
      setSocialLinks={setSocialLinks}
      handleUpdateSocialLinks={handleUpdateSocialLinks}
    />
    <SettingsDialog
      isOpen={isSettingsOpen}
      onOpenChange={setIsSettingsOpen}
      handleSignOut={handleSignOut}
      onNotificationsClick={() => {
        setIsSettingsOpen(false);
        setIsNotificationsOpen(true);
      }}
      onSubscriptionClick={() => {
        setIsSettingsOpen(false);
        setIsSubscriptionOpen(true);
      }}
    />
    <MessagesDialog
      isOpen={isMessagesOpen}
      onOpenChange={(open) => {
        setIsMessagesOpen(open);
        if (!open) setSelectedConversationUser(null);
      }}
      conversations={conversations}
      selectedConversationUser={selectedConversationUser}
      setSelectedConversationUser={setSelectedConversationUser}
    />
    <SubscriptionDialog
      isOpen={isSubscriptionOpen}
      onOpenChange={setIsSubscriptionOpen}
      subscription={subscription}
    />
    <NotificationsDialog
      isOpen={isNotificationsOpen}
      onOpenChange={setIsNotificationsOpen}
    />
  </>
);

export default ProfileDialogs;

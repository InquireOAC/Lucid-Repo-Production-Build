
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import LoadingScreen from "@/components/profile/LoadingScreen";
import UserNotFound from "@/components/profile/UserNotFound";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import SocialLinksDialog from "@/components/profile/SocialLinksDialog";
import MessagesDialog from "@/components/profile/MessagesDialog";
import SettingsDialog from "@/components/profile/SettingsDialog";
import SubscriptionDialog from "@/components/profile/SubscriptionDialog";
import NotificationsDialog from "@/components/profile/NotificationsDialog";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import { useEffect as useEffectOnce } from "react";

const Profile = () => {
  const { userId } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const {
    isOwnProfile,
    viewedProfile,
    isFollowing,
    displayName,
    username,
    bio,
    avatarUrl,
    socialLinks,
    dreamCount,
    followersCount,
    followingCount,
    publicDreams,
    likedDreams,
    conversations,
    subscription,
    fetchUserProfile,
    checkIfFollowing,
    handleFollow,
    fetchSubscription,
    handleUpdateProfile,
    handleUpdateSocialLinks,
    handleAvatarChange,
    handleStartConversation,
    handleSignOut
  } = useProfileData(user, profile, userId);

  const { refetchPublicDreams } = useProfileDreams(user, userId);
  
  useEffect(() => {
    if (userId && user) {
      fetchUserProfile(userId);
      checkIfFollowing();
    }
    
    if (user && !userId) {
      fetchSubscription();
    }
  }, [userId, user]);
  
  // Show loading screen while authentication is in progress
  if (authLoading) {
    return <LoadingScreen />;
  }
  
  // Show not found if no user is logged in and no userId is provided
  if (!user && !userId) {
    return <UserNotFound />;
  }
  
  // For other users' profiles, show not found if the profile wasn't found
  if (userId && !viewedProfile && !authLoading) {
    return <UserNotFound />;
  }

  return (
    <div className="min-h-screen dream-background p-4">
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        profile={viewedProfile || profile}
        displayName={displayName}
        username={username}
        avatarUrl={avatarUrl}
        dreamCount={dreamCount}
        followersCount={followersCount}
        followingCount={followingCount}
        bio={bio}
        isFollowing={isFollowing}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onEditSocialLinks={() => setIsSocialLinksOpen(true)}
        onFollow={handleFollow}
        onMessage={() => handleStartConversation(userId as string)}
        onSettings={() => setIsSettingsOpen(true)}
        onManageSubscription={() => setIsSubscriptionOpen(true)}
        onNotifications={() => setIsNotificationsOpen(true)}
      />
      
      <ProfileTabs
        isOwnProfile={isOwnProfile}
        publicDreams={publicDreams}
        likedDreams={likedDreams}
      />

      {/* Dialogs */}
      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        displayName={displayName}
        username={username}
        bio={bio}
        avatarUrl={avatarUrl}
        onUpdate={handleUpdateProfile}
        onAvatarChange={handleAvatarChange}
      />
      
      <SocialLinksDialog
        open={isSocialLinksOpen}
        onOpenChange={setIsSocialLinksOpen}
        socialLinks={socialLinks}
        onUpdate={handleUpdateSocialLinks}
      />
      
      <MessagesDialog
        open={isMessagesOpen}
        onOpenChange={setIsMessagesOpen}
        conversations={conversations}
      />
      
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onSignOut={handleSignOut}
      />
      
      <SubscriptionDialog
        open={isSubscriptionOpen}
        onOpenChange={setIsSubscriptionOpen}
        subscription={subscription}
      />
      
      <NotificationsDialog
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />
    </div>
  );
};

export default Profile;

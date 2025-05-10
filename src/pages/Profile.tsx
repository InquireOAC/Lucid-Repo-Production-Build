
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const Profile = () => {
  const { userId } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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

  const { refreshDreams } = useProfileDreams(user, userId);
  
  useEffect(() => {
    if (userId && user) {
      fetchUserProfile(userId);
      checkIfFollowing(userId);
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
        onFollow={() => handleFollow()}
        onMessage={() => handleStartConversation()}
        onSettings={() => setIsSettingsOpen(true)}
        onManageSubscription={() => setIsSubscriptionOpen(true)}
        onNotifications={() => setIsNotificationsOpen(true)}
      />
      
      <ProfileTabs
        isOwnProfile={isOwnProfile}
        publicDreams={publicDreams}
        likedDreams={likedDreams}
        refreshDreams={refreshDreams}
      />

      {/* Dialogs */}
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        displayName={displayName}
        username={username}
        bio={bio}
        avatarUrl={avatarUrl}
        onUpdate={handleUpdateProfile}
        onAvatarChange={handleAvatarChange}
        userId={user?.id || ""}
        isUploading={false}
        setDisplayName={() => {}}
        setUsername={() => {}}
        setBio={() => {}}
      />
      
      <SocialLinksDialog
        isOpen={isSocialLinksOpen}
        onOpenChange={setIsSocialLinksOpen}
        socialLinks={socialLinks}
        handleUpdateSocialLinks={handleUpdateSocialLinks}
        setSocialLinks={() => {}}
      />
      
      <MessagesDialog
        isOpen={isMessagesOpen}
        onOpenChange={setIsMessagesOpen}
        conversations={conversations || []}
      />
      
      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        handleSignOut={handleSignOut}
        onSubscriptionClick={() => setIsSubscriptionOpen(true)}
      />
      
      <SubscriptionDialog
        isOpen={isSubscriptionOpen}
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

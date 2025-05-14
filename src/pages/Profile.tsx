import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DreamEntry } from "@/types/dream";

// Import refactored components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import SocialLinksDialog from "@/components/profile/SocialLinksDialog";
import SettingsDialog from "@/components/profile/SettingsDialog";
import MessagesDialog from "@/components/profile/MessagesDialog";
import LoadingScreen from "@/components/profile/LoadingScreen";
import UserNotFound from "@/components/profile/UserNotFound";
import SubscriptionDialog from "@/components/profile/SubscriptionDialog";
import NotificationsDialog from "@/components/profile/NotificationsDialog";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  // Using the refactored hook
  const {
    isOwnProfile,
    viewedProfile,
    isFollowing,
    displayName,
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    socialLinks,
    setSocialLinks,
    dreamCount,
    followersCount,
    followingCount,
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
  
  // Use the useProfileDreams hook directly here
  const {
    publicDreams,
    likedDreams,
    refreshDreams
  } = useProfileDreams(user, userId);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Add logs about which profile is being fetched
  useEffect(() => {
    console.log("Profile page loading for userId:", userId, "isOwnProfile:", isOwnProfile);
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!isOwnProfile && userId) {
      fetchUserProfile(userId);
      checkIfFollowing(userId);
    }
  }, [user, profile, userId]);

  // Add log for fetchSubscription
  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Refresh public dreams every time the profile is loaded
  useEffect(() => {
    if (isOwnProfile || (userId && user)) {
      // Add a small delay to ensure profile data is loaded
      const timer = setTimeout(() => {
        refreshDreams();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOwnProfile, userId, user]);
  
  // Loading state
  if (!user) {
    return <LoadingScreen />;
  }
  
  // Add log for profile loading/failure
  if (!isOwnProfile && !viewedProfile) {
    console.warn("Profile: User not found for userId:", userId);
    return <UserNotFound onGoBack={() => navigate("/")} />;
  }
  
  const profileToShow = isOwnProfile ? profile : viewedProfile;
  
  // Add log for loaded profile to show
  useEffect(() => {
    console.log("Profile profileToShow = ", profileToShow);
  }, [profileToShow]);
  
  // Main render
  return (
    <div className="min-h-screen dream-background p-4">
      <div className="max-w-3xl mx-auto">
        <ProfileHeader 
          profileToShow={profileToShow}
          isOwnProfile={isOwnProfile}
          dreamCount={dreamCount}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
          setIsEditProfileOpen={setIsEditProfileOpen}
          setIsMessagesOpen={setIsMessagesOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsSocialLinksOpen={setIsSocialLinksOpen}
          handleFollow={handleFollow}
          handleStartConversation={handleStartConversation}
        />
        
        <ProfileTabs 
          publicDreams={publicDreams}
          likedDreams={likedDreams}
          isOwnProfile={isOwnProfile}
          refreshDreams={refreshDreams}
        />
      </div>
      
      {/* Dialogs */}
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
        userId={user.id}
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
        onOpenChange={setIsMessagesOpen}
        conversations={conversations}
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
    </div>
  );
};

export default Profile;

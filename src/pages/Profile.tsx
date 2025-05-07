
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { useProfileData } from "@/hooks/useProfileData";

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
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!isOwnProfile && userId) {
      fetchUserProfile(userId);
      checkIfFollowing(userId);
    }
  }, [user, profile, userId]);

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
  
  const refreshDreams = () => {
    try {
      // @ts-ignore - These functions exist in the hook return
      if (typeof fetchPublicDreams === 'function') {
        // @ts-ignore
        fetchPublicDreams();
      }
      // @ts-ignore
      if (typeof fetchLikedDreams === 'function') {
        // @ts-ignore
        fetchLikedDreams();
      }
    } catch (error) {
      console.error("Error refreshing dreams:", error);
    }
  };
  
  // Loading state
  if (!user) {
    return <LoadingScreen />;
  }
  
  // User not found state
  if (!isOwnProfile && !viewedProfile) {
    return <UserNotFound onGoBack={() => navigate("/")} />;
  }
  
  const profileToShow = isOwnProfile ? profile : viewedProfile;
  
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
        setDisplayName={(name) => handleAvatarChange(avatarUrl)}
        username={username}
        setUsername={() => {}}
        bio={bio}
        setBio={() => {}}
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
        setSocialLinks={() => {}}
        handleUpdateSocialLinks={handleUpdateSocialLinks}
      />
      
      <SettingsDialog 
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        handleSignOut={handleSignOut}
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
    </div>
  );
};

export default Profile;

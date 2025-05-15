
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/profile/LoadingScreen";
import UserNotFound from "@/components/profile/UserNotFound";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileDialogs from "./ProfileDialogs";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";

const ProfileContent = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

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
    handleSignOut,
  } = useProfileData(user, profile, userId);

  const {
    publicDreams,
    likedDreams,
    refreshDreams,
  } = useProfileDreams(user, userId);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (userId && userId !== user.id) {
      // If a user ID param is present, load THAT profile for view
      fetchUserProfile(userId);
      checkIfFollowing(userId);
    }
  }, [user, profile, userId]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (isOwnProfile || (userId && user)) {
      const timer = setTimeout(() => {
        refreshDreams();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOwnProfile, userId, user]);

  // Loading state: wait for all fetch calls to complete before showing missing profile
  if (!user) {
    return <LoadingScreen />;
  }

  // Only show "not found" if we're visiting another user's profile and the data is null
  if (userId && userId !== user.id && !viewedProfile) {
    return (
      <div className="min-h-screen dream-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">This user doesn’t exist or has a private profile.</h3>
          <p className="text-muted-foreground mb-2">They may have deleted or restricted their account.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const profileToShow = isOwnProfile ? profile : viewedProfile;

  // Defensive: If profileToShow exists but lacks core info, display placeholder UI
  const isProfileIncomplete =
    profileToShow &&
    !profileToShow.display_name &&
    !profileToShow.username &&
    !profileToShow.bio &&
    !profileToShow.avatar_url;

  if (profileToShow && isProfileIncomplete) {
    return (
      <div className="min-h-screen dream-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">This user hasn&apos;t set up their profile yet.</h3>
          <p className="text-muted-foreground mb-2">No public profile information available.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
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
        avatarUrl={avatarUrl}
        handleAvatarChange={handleAvatarChange}
        handleUpdateProfile={handleUpdateProfile}
        userId={user.id}
        socialLinks={socialLinks}
        setSocialLinks={setSocialLinks}
        handleUpdateSocialLinks={handleUpdateSocialLinks}
        handleSignOut={handleSignOut}
        conversations={conversations}
        subscription={subscription}
      />
    </>
  );
};

export default ProfileContent;

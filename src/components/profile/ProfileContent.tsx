import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileDialogs from "./ProfileDialogs";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import FollowersModal from "@/components/profile/FollowersModal";
import ProfileLoadingScreen from "./ProfileLoadingScreen";
import ProfileNotFound from "./ProfileNotFound";
import ProfileEmpty from "./ProfileEmpty";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";

// Wait until viewedProfile is loaded (for others) before rendering profile hooks/components!
const ProfileContent = () => {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const effectiveIdentifier = username || userId;

  const {
    isOwnProfile,
    viewedProfile,
    isFollowing,
    displayName,
    setDisplayName,
    username: currentUsername,
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
  } = useProfileData(user, profile, effectiveIdentifier);

  // 1. Decide whose profile to show and their id - but only after profile(s) loaded!
  let profileToShow: any = null;
  let profileIdForHooks: string | null = null;
  if (isOwnProfile) {
    profileToShow = profile;
    profileIdForHooks = profile?.id ?? null;
  } else {
    if (!viewedProfile) {
      // If viewing another user and data is loading
      // Don't render subcomponents yet
      return <ProfileLoadingScreen />;
    }
    profileToShow = viewedProfile;
    profileIdForHooks = viewedProfile.id ?? null;
  }

  // If viewing someone else and viewedProfile is "not found"
  if (
    !isOwnProfile &&
    effectiveIdentifier &&
    effectiveIdentifier !== user?.id &&
    effectiveIdentifier !== profile?.username &&
    !viewedProfile
  ) {
    return <ProfileNotFound />;
  }
  // If somehow missing valid UUID, bail out
  if (!profileIdForHooks) {
    return <ProfileNotFound />;
  }

  // 2. Secure hooks only run with real UUID, now guaranteed loaded
  const { publicDreams, likedDreams, refreshDreams } = useProfileDreams(user, profileIdForHooks);
  const { followers, following, fetchFollowers, fetchFollowing } = useProfileFollowers(profileIdForHooks);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // When switching profiles, fetch new profile and follow status
    if (
      effectiveIdentifier &&
      effectiveIdentifier !== user.id &&
      effectiveIdentifier !== profile?.username
    ) {
      fetchUserProfile(effectiveIdentifier);
      checkIfFollowing(effectiveIdentifier);
    }
    // Re-route if not logged in
  }, [user, profile, effectiveIdentifier]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  useEffect(() => {
    // Whenever a correct profileId is detected, refresh dreams
    if (profileIdForHooks) {
      const timer = setTimeout(() => {
        refreshDreams?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [profileIdForHooks, isOwnProfile, effectiveIdentifier, user]);

  // Display empty if truly no profile info
  if (
    profileToShow &&
    !profileToShow.display_name &&
    !profileToShow.username &&
    !profileToShow.bio &&
    !profileToShow.avatar_url
  ) {
    return <ProfileEmpty />;
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
        onFollowersClick={() => {
          setShowFollowers(true);
          fetchFollowers();
        }}
        onFollowingClick={() => {
          setShowFollowing(true);
          fetchFollowing();
        }}
      />
      <ProfileTabs
        publicDreams={publicDreams}
        likedDreams={likedDreams}
        isOwnProfile={isOwnProfile}
        refreshDreams={refreshDreams}
      />
      <FollowersModal
        title="Followers"
        open={showFollowers}
        onOpenChange={setShowFollowers}
        users={followers}
      />
      <FollowersModal
        title="Following"
        open={showFollowing}
        onOpenChange={setShowFollowing}
        users={following}
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
        username={currentUsername}
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

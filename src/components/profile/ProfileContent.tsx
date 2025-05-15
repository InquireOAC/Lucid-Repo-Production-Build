
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";
import ProfileLoadingScreen from "./ProfileLoadingScreen";
import ProfileNotFound from "./ProfileNotFound";
import ProfileEmpty from "./ProfileEmpty";
import ProfileMainContent from "./ProfileMainContent";

/**
 * Compute which profile to show (own or other), and the ID for further profile-related hooks.
 */
function computeProfileTargets({
  user,
  profile,
  viewedProfile,
  isOwnProfile,
  effectiveIdentifier,
}: {
  user: any;
  profile: any;
  viewedProfile: any;
  isOwnProfile: boolean;
  effectiveIdentifier: string | undefined;
}) {
  let profileToShow = null;
  let profileIdForHooks: string | null = null;
  // Own profile logic
  if (isOwnProfile) {
    profileToShow = profile;
    profileIdForHooks = profile?.id ?? null;
  } else {
    profileToShow = viewedProfile;
    profileIdForHooks = viewedProfile?.id ?? null;
  }
  return { profileToShow, profileIdForHooks };
}

/**
 * Handles all the "guard rails" around which state to show for loaded profile.
 */
function ProfileStateGuard({
  loading,
  effectiveIdentifier,
  user,
  profile,
  isOwnProfile,
  viewedProfile,
  children,
}: {
  loading: boolean;
  effectiveIdentifier: string | undefined;
  user: any;
  profile: any;
  isOwnProfile: boolean;
  viewedProfile: any;
  children: React.ReactNode;
}) {
  // Loading
  if (loading) return <ProfileLoadingScreen />;
  // Not logged in (rare, but can happen in hot reloads)
  if (!user) return <ProfileLoadingScreen />;
  // 404 (other user)
  if (
    !isOwnProfile &&
    effectiveIdentifier &&
    effectiveIdentifier !== user?.id &&
    effectiveIdentifier !== profile?.username &&
    !viewedProfile
  ) {
    return <ProfileNotFound />;
  }
  // If profileToShow is empty
  if (
    viewedProfile &&
    !viewedProfile.display_name &&
    !viewedProfile.username &&
    !viewedProfile.bio &&
    !viewedProfile.avatar_url
  ) {
    return <ProfileEmpty />;
  }
  // If all good
  return <>{children}</>;
}

const ProfileContent = () => {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const effectiveIdentifier = username || userId;

  // Custom hook to load/refresh all major profile states
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

  const [loadingProfile, setLoadingProfile] = useState(false);

  // Ensure switching profiles in the UI triggers correct fetch
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // If viewing another user...
    if (
      effectiveIdentifier &&
      effectiveIdentifier !== user.id &&
      effectiveIdentifier !== profile?.username
    ) {
      setLoadingProfile(true);
      fetchUserProfile(effectiveIdentifier).finally(() => setLoadingProfile(false));
      checkIfFollowing(effectiveIdentifier);
    }
  }, [user, profile, effectiveIdentifier]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // --- Use memo to guard against hook execution with an invalid ID ---
  const { profileToShow, profileIdForHooks } = useMemo(
    () => computeProfileTargets({ user, profile, viewedProfile, isOwnProfile, effectiveIdentifier }),
    [user, profile, viewedProfile, isOwnProfile, effectiveIdentifier]
  );

  // Profile hooks for dreams and followers -- only runs when profileId is valid
  const { publicDreams, likedDreams, refreshDreams } = useProfileDreams(user, profileIdForHooks);
  const { followers, following, fetchFollowers, fetchFollowing } = useProfileFollowers(profileIdForHooks);

  // All dialog/modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Refresh dreams when switching to valid hooks
  useEffect(() => {
    if (profileIdForHooks) {
      const timer = setTimeout(() => {
        refreshDreams?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [profileIdForHooks, isOwnProfile, effectiveIdentifier, user]);

  // -------------- Render guarded states and main content -----------------
  return (
    <ProfileStateGuard
      loading={loadingProfile}
      effectiveIdentifier={effectiveIdentifier}
      user={user}
      profile={profile}
      isOwnProfile={isOwnProfile}
      viewedProfile={viewedProfile}
    >
      <ProfileMainContent
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
        publicDreams={publicDreams}
        likedDreams={likedDreams}
        refreshDreams={refreshDreams}
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
        userId={user?.id}
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
    </ProfileStateGuard>
  );
};

export default ProfileContent;

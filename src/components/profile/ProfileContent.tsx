
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";
import ProfileMainContent from "./ProfileMainContent";
import ProfileStateGuard from "./ProfileStateGuard";
import { computeProfileTargets } from "./computeProfileTargets";
import { useProfileDialogStates } from "./ProfileDialogStates";
import PullToRefresh from "@/components/ui/PullToRefresh";

// helper to extract uuid safely
function extractProfileUuid(profileObj: any): string | undefined {
  if (!profileObj) return undefined;
  // 'id' field is always uuid for profiles table
  return profileObj.id;
}

const ProfileContent = () => {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const effectiveIdentifier = username || userId;

  // State for loading profile
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Modal/dialog state hooks
  const {
    isEditProfileOpen, setIsEditProfileOpen,
    isSettingsOpen, setIsSettingsOpen,
    isMessagesOpen, setIsMessagesOpen,
    isSocialLinksOpen, setIsSocialLinksOpen,
    isSubscriptionOpen, setIsSubscriptionOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    showFollowers, setShowFollowers,
    showFollowing, setShowFollowing
  } = useProfileDialogStates();

  // Custom profile data (returns .viewedProfile)
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
    avatarSymbol,
    setAvatarSymbol,
    avatarColor,
    setAvatarColor,
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
    handleStartConversation,
    handleSignOut,
  } = useProfileData(user, profile, effectiveIdentifier);

  // Ensure switching profiles in the UI triggers correct fetch
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
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

  useEffect(() => { if (user) fetchSubscription(); }, [user]);

  // Use memo to guard against hook execution with an invalid ID
  const { profileToShow, profileIdForHooks } = useMemo(
    () => computeProfileTargets({ user, profile, viewedProfile, isOwnProfile, effectiveIdentifier }),
    [user, profile, viewedProfile, isOwnProfile, effectiveIdentifier]
  );

  // Profile hooks for dreams and followers -- only runs when profileId is valid
  const { publicDreams, likedDreams, refreshDreams } = useProfileDreams(user, profileIdForHooks);
  const { followers, following, fetchFollowers, fetchFollowing, followersCount: followersCountHook, followingCount: followingCountHook } = useProfileFollowers(profileIdForHooks);

  // Correct: Get "uuid" for the profile currently displayed, for follow logic
  const viewedProfileUuid = extractProfileUuid(viewedProfile);

  // Refresh dreams when switching to valid hooks
  useEffect(() => {
    if (profileIdForHooks) {
      const timer = setTimeout(() => { refreshDreams?.(); }, 300);
      return () => clearTimeout(timer);
    }
  }, [profileIdForHooks, isOwnProfile, effectiveIdentifier, user]);

  // Handler: Pull to refresh (refresh avatar/profile + refresh dreams/likes)
  const handlePullToRefresh = async () => {
    if (effectiveIdentifier) {
      await fetchUserProfile(effectiveIdentifier);
    } else if (user?.id) {
      // No identifier but user is logged in: refresh own profile
      await fetchUserProfile(user.id);
    }
    // Always refresh dreams
    await refreshDreams?.();
  };

  // -------------- Render guarded states and main content -----------------
  return (
    <PullToRefresh onRefresh={handlePullToRefresh}>
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
          followersCount={followersCountHook}
          followingCount={followingCountHook}
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
          isSocialLinksOpen={isSocialLinksOpen}
          isSettingsOpen={isSettingsOpen}
          isMessagesOpen={isMessagesOpen}
          isSubscriptionOpen={isSubscriptionOpen}
          isNotificationsOpen={isNotificationsOpen}
          displayName={displayName}
          setDisplayName={setDisplayName}
          username={currentUsername}
          setUsername={setUsername}
          bio={bio}
          setBio={setBio}
          avatarSymbol={avatarSymbol}
          setAvatarSymbol={setAvatarSymbol}
          avatarColor={avatarColor}
          setAvatarColor={setAvatarColor}
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
    </PullToRefresh>
  );
};

export default ProfileContent;

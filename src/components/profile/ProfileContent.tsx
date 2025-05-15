
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileDialogs from "./ProfileDialogs";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import FollowersModal from "@/components/profile/FollowersModal";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";
import ProfileLoadingScreen from "./ProfileLoadingScreen";
import ProfileNotFound from "./ProfileNotFound";
import ProfileEmpty from "./ProfileEmpty";

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

  const {
    publicDreams,
    likedDreams,
    refreshDreams,
  } = useProfileDreams(user, effectiveIdentifier);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const { followers, following, fetchFollowers, fetchFollowing } = useProfileFollowers(
    profile?.id || ""
  );

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Fetch by identifier (username preferred)
    if (effectiveIdentifier && effectiveIdentifier !== user.id && effectiveIdentifier !== profile?.username) {
      fetchUserProfile(effectiveIdentifier);
      checkIfFollowing(effectiveIdentifier);
    }
  }, [user, profile, effectiveIdentifier]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (isOwnProfile || (effectiveIdentifier && user)) {
      const timer = setTimeout(() => {
        refreshDreams();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOwnProfile, effectiveIdentifier, user]);

  if (!user) {
    return <ProfileLoadingScreen />;
  }

  if (effectiveIdentifier && effectiveIdentifier !== user.id && !viewedProfile) {
    return <ProfileNotFound />;
  }

  const profileToShow = isOwnProfile ? profile : viewedProfile;

  const isProfileIncomplete =
    profileToShow &&
    !profileToShow.display_name &&
    !profileToShow.username &&
    !profileToShow.bio &&
    !profileToShow.avatar_url;

  if (profileToShow && isProfileIncomplete) {
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
        onFollowersClick={() => { setShowFollowers(true); fetchFollowers(); }}
        onFollowingClick={() => { setShowFollowing(true); fetchFollowing(); }}
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

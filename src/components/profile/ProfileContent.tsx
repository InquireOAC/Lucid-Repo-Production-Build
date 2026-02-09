import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import { useProfileFollowers } from "@/hooks/useProfileFollowers";
import ProfileMainContent from "./ProfileMainContent";
import ProfileStateGuard from "./ProfileStateGuard";
import { computeProfileTargets } from "./computeProfileTargets";
import { useProfileDialogStates } from "./ProfileDialogStates";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { useDirectConversation } from "@/hooks/useDirectConversation";
import { useConversations } from "@/hooks/useConversations";

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
  const location = useLocation();
  
  // Use userId or username, whichever is provided in the URL
  const effectiveIdentifier = userId || username;

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

  // Get conversations fetch function from useConversations hook
  const { fetchConversations } = useConversations(user);

  // Get the UUID of the viewed profile for conversation handling
  const viewedProfileUuid = extractProfileUuid(viewedProfile);
  
  // Direct conversation hook for messaging other users
  const { openChatWithUser, loading: conversationLoading } = useDirectConversation(
    user?.id, 
    viewedProfileUuid
  );

  // State for selected conversation user when opening messages dialog
  const [selectedConversationUser, setSelectedConversationUser] = useState<any>(null);

  // Enhanced message handler for starting conversations with other users
  const handleMessageClick = () => {
    if (isOwnProfile) {
      // If it's own profile, just open the messages dialog to see all conversations
      setIsMessagesOpen(true);
    } else if (viewedProfile) {
      // If viewing another user's profile, start a conversation with them
      openChatWithUser((user) => {
        setSelectedConversationUser(user);
        setIsMessagesOpen(true);
      });
    }
  };

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

  // Refresh data when navigating to profile (background refresh)
  useEffect(() => {
    if (location.pathname.includes('/profile') && user) {
      const timer = setTimeout(() => {
        if (effectiveIdentifier) {
          fetchUserProfile(effectiveIdentifier);
        } else {
          fetchUserProfile(user.id);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, user, effectiveIdentifier]);

  // Use memo to guard against hook execution with an invalid ID
  const { profileToShow, profileIdForHooks } = useMemo(
    () => computeProfileTargets({ user, profile, viewedProfile, isOwnProfile, effectiveIdentifier }),
    [user, profile, viewedProfile, isOwnProfile, effectiveIdentifier]
  );

  // Profile hooks for dreams and followers -- only runs when profileId is valid
  const { publicDreams, likedDreams, refreshDreams } = useProfileDreams(user, profileIdForHooks);
  const { followers, following, fetchFollowers, fetchFollowing, followersCount: followersCountHook, followingCount: followingCountHook } = useProfileFollowers(profileIdForHooks);

  // Refresh dreams when switching to valid hooks
  useEffect(() => {
    if (profileIdForHooks) {
      const timer = setTimeout(() => { refreshDreams?.(); }, 300);
      return () => clearTimeout(timer);
    }
  }, [profileIdForHooks, isOwnProfile, effectiveIdentifier, user]);

  // Refresh subscription data when subscription dialog opens
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { subscription: currentSubscription, isLoading: subscriptionLoading, fetchSubscription: refreshSubscription } = useSubscription(user);
  const handleSubscriptionDialogOpen = (open: boolean) => {
    setSubscriptionDialogOpen(open);
    if (open && user) {
      refreshSubscription();
    }
  };

  // Reset selected conversation user when messages dialog closes
  const handleMessagesDialogChange = (open: boolean) => {
    setIsMessagesOpen(open);
    if (!open) {
      setSelectedConversationUser(null);
    }
  };

  // -------------- Render guarded states and main content -----------------
  return (
    <div className="w-full">
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
          setIsMessagesOpen={handleMessagesDialogChange}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsSocialLinksOpen={setIsSocialLinksOpen}
          setIsSubscriptionOpen={setIsSubscriptionOpen}
          handleFollow={handleFollow}
          handleStartConversation={handleMessageClick}
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
          setIsNotificationsOpen={setIsNotificationsOpen}
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
          selectedConversationUser={selectedConversationUser}
          setSelectedConversationUser={setSelectedConversationUser}
          fetchConversations={fetchConversations}
        />
      </ProfileStateGuard>
      <SubscriptionDialog
        isOpen={subscriptionDialogOpen}
        onOpenChange={handleSubscriptionDialogOpen}
      />
    </div>
  );
};

export default ProfileContent;

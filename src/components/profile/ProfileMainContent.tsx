import React, { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import FollowersModal from "./FollowersModal";
import ProfileDialogs from "./ProfileDialogs";

export default function ProfileMainContent(props: any) {
  const [selectedConversationUser, setSelectedConversationUser] = useState<any>(null);

  return (
    <>
      <ProfileHeader
        profileToShow={props.profileToShow}
        isOwnProfile={props.isOwnProfile}
        dreamCount={props.dreamCount}
        followersCount={props.followersCount}
        followingCount={props.followingCount}
        isFollowing={props.isFollowing}
        setIsEditProfileOpen={props.setIsEditProfileOpen}
        setIsMessagesOpen={props.setIsMessagesOpen}
        setIsSettingsOpen={props.setIsSettingsOpen}
        setIsSubscriptionOpen={props.setIsSubscriptionOpen}
        setIsSocialLinksOpen={props.setIsSocialLinksOpen}
        handleFollow={props.handleFollow}
        handleStartConversation={props.handleStartConversation}
        onFollowersClick={props.onFollowersClick}
        onFollowingClick={props.onFollowingClick}
        setSelectedConversationUser={setSelectedConversationUser}
      />
      <ProfileTabs
        publicDreams={props.publicDreams}
        likedDreams={props.likedDreams}
        isOwnProfile={props.isOwnProfile}
        refreshDreams={props.refreshDreams}
      />
      <FollowersModal
        title="Followers"
        open={props.showFollowers}
        onOpenChange={props.setShowFollowers}
        users={props.followers}
      />
      <FollowersModal
        title="Following"
        open={props.showFollowing}
        onOpenChange={props.setShowFollowing}
        users={props.following}
      />
      <ProfileDialogs
        isEditProfileOpen={props.isEditProfileOpen}
        setIsEditProfileOpen={props.setIsEditProfileOpen}
        isSocialLinksOpen={props.isSocialLinksOpen}
        setIsSocialLinksOpen={props.setIsSocialLinksOpen}
        isSettingsOpen={props.isSettingsOpen}
        setIsSettingsOpen={props.setIsSettingsOpen}
        isMessagesOpen={props.isMessagesOpen}
        setIsMessagesOpen={props.setIsMessagesOpen}
        isSubscriptionOpen={props.isSubscriptionOpen}
        setIsSubscriptionOpen={props.setIsSubscriptionOpen}
        isNotificationsOpen={props.isNotificationsOpen}
        setIsNotificationsOpen={props.setIsNotificationsOpen}
        displayName={props.displayName}
        setDisplayName={props.setDisplayName}
        username={props.username}
        setUsername={props.setUsername}
        bio={props.bio}
        setBio={props.setBio}
        avatarSymbol={props.avatarSymbol}
        setAvatarSymbol={props.setAvatarSymbol}
        avatarColor={props.avatarColor}
        setAvatarColor={props.setAvatarColor}
        handleUpdateProfile={props.handleUpdateProfile}
        userId={props.userId}
        socialLinks={props.socialLinks}
        setSocialLinks={props.setSocialLinks}
        handleUpdateSocialLinks={props.handleUpdateSocialLinks}
        handleSignOut={props.handleSignOut}
        conversations={props.conversations}
        subscription={props.subscription}
        selectedConversationUser={selectedConversationUser}
        setSelectedConversationUser={setSelectedConversationUser}
        fetchConversations={props.fetchConversations}
      />
    </>
  );
}

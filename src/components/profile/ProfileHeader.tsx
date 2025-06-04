
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, MessageCircle, UserPlus, UserMinus, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProfileAvatar from "./SymbolAvatar";
import ProfileStatsBar from "./ProfileStatsBar";
import ProfileSocialLinks from "./ProfileSocialLinks";
import BlockUserButton from "../moderation/BlockUserButton";
import UnblockUserButton from "../moderation/UnblockUserButton";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface ProfileHeaderProps {
  profileToShow: any;
  isOwnProfile: boolean;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  setIsMessagesOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsSubscriptionOpen: (open: boolean) => void;
  setIsSocialLinksOpen: (open: boolean) => void;
  handleFollow: () => void;
  handleStartConversation: (userId: string) => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  setSelectedConversationUser: (user: any) => void;
}

const ProfileHeader = ({
  profileToShow,
  isOwnProfile,
  dreamCount,
  followersCount,
  followingCount,
  isFollowing,
  setIsEditProfileOpen,
  setIsMessagesOpen,
  setIsSettingsOpen,
  setIsSubscriptionOpen,
  setIsSocialLinksOpen,
  handleFollow,
  handleStartConversation,
  onFollowersClick,
  onFollowingClick,
  setSelectedConversationUser
}: ProfileHeaderProps) => {
  const { isUserBlocked } = useBlockedUsers();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFollowStateChanged = () => {
    // Force refresh of follow state by triggering a re-render
    setRefreshKey(prev => prev + 1);
    // Call the follow handler to refresh the actual follow state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const isBlocked = profileToShow?.id ? isUserBlocked(profileToShow.id) : false;

  if (!profileToShow) return null;

  const displayName = profileToShow.display_name || profileToShow.username || "User";
  const fallbackLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="text-center space-y-4">
      {/* Centered Profile Avatar */}
      <div className="flex justify-center">
        <ProfileAvatar
          symbol={profileToShow.avatar_symbol}
          color={profileToShow.avatar_color}
          fallbackLetter={fallbackLetter}
          size={80}
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold">{displayName}</h1>
        {profileToShow.username && (
          <p className="text-muted-foreground">@{profileToShow.username}</p>
        )}
        {profileToShow.bio && (
          <p className="text-sm text-muted-foreground mt-2">{profileToShow.bio}</p>
        )}
        
        {/* Centered Social Links */}
        <div className="flex justify-center">
          <ProfileSocialLinks
            socialLinks={profileToShow.social_links}
            isOwnProfile={isOwnProfile}
            onEdit={() => setIsSocialLinksOpen(true)}
          />
        </div>
      </div>

      <ProfileStatsBar
        dreamCount={dreamCount}
        followersCount={followersCount}
        followingCount={followingCount}
        onFollowersClick={onFollowersClick}
        onFollowingClick={onFollowingClick}
      />

      <div className="flex gap-2 justify-center">
        {isOwnProfile ? (
          <>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(true)}>
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => setIsMessagesOpen(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsSubscriptionOpen(true)}>
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            {!isBlocked ? (
              <>
                <Button
                  key={refreshKey}
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  className="flex-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleStartConversation(profileToShow.id);
                    setSelectedConversationUser(profileToShow);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <BlockUserButton
                  userToBlock={{
                    id: profileToShow.id,
                    username: profileToShow.username,
                    display_name: profileToShow.display_name
                  }}
                  onFollowStateChanged={handleFollowStateChanged}
                  variant="outline"
                  size="default"
                />
              </>
            ) : (
              <UnblockUserButton
                userToUnblock={{
                  id: profileToShow.id,
                  username: profileToShow.username,
                  display_name: profileToShow.display_name
                }}
                onUserUnblocked={handleFollowStateChanged}
                variant="outline"
                size="default"
              />
            )}
          </>
        )}
      </div>

      {isBlocked && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">You have blocked this user</p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;

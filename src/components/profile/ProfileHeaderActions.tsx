
import React from "react";
import { Button } from "@/components/ui/button";
import { Crown, Settings, MessageCircle, UserPlus, UserMinus, Users } from "lucide-react";

interface ProfileHeaderActionsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowClick: () => void;
  onMessageClick: () => void;
  onSettingsClick: () => void;
  onSubscriptionClick: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  followersCount: number;
  followingCount: number;
}

const ProfileHeaderActions = ({
  isOwnProfile,
  isFollowing,
  onFollowClick,
  onMessageClick,
  onSettingsClick,
  onSubscriptionClick,
  onFollowersClick,
  onFollowingClick,
  followersCount,
  followingCount
}: ProfileHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      {/* Followers/Following buttons */}
      <Button
        variant="ghost"
        onClick={onFollowersClick}
        className="flex items-center gap-1 px-3 py-1 h-8 text-sm"
      >
        <Users className="h-3 w-3" />
        <span>{followersCount} followers</span>
      </Button>
      
      <Button
        variant="ghost"
        onClick={onFollowingClick}
        className="flex items-center gap-1 px-3 py-1 h-8 text-sm"
      >
        <Users className="h-3 w-3" />
        <span>{followingCount} following</span>
      </Button>

      {isOwnProfile ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSubscriptionClick} size="sm">
            <Crown className="h-4 w-4 mr-2" />
            Subscription
          </Button>
          <Button variant="outline" onClick={onSettingsClick} size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant={isFollowing ? "outline" : "default"}
            onClick={onFollowClick}
            size="sm"
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
          <Button variant="outline" onClick={onMessageClick} size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeaderActions;

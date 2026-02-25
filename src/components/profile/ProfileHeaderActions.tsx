import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Settings, MessageCircle, UserPlus, UserMinus, Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

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
}: ProfileHeaderActionsProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  return (
    <div className="flex items-center gap-2">
      {isOwnProfile ? (
        <>
          {isAdmin && (
            <Button variant="outline" onClick={() => navigate("/admin")} size="sm" className="rounded-full">
              <Shield className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={onSubscriptionClick} size="sm" className="rounded-full">
            <Crown className="h-4 w-4 mr-1" />
            Pro
          </Button>
          <Button variant="outline" onClick={onSettingsClick} size="sm" className="rounded-full">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onMessageClick} size="sm" className="rounded-full">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            variant={isFollowing ? "outline" : "aurora"}
            onClick={onFollowClick}
            size="sm"
            className="rounded-full"
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-4 w-4 mr-1" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Follow
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onMessageClick} size="sm" className="rounded-full">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default ProfileHeaderActions;

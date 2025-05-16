import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, MessageSquare, Settings, UserPlus, BadgeDollarSign } from "lucide-react";

interface ProfileHeaderActionsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onMessages: () => void;
  onSettings: () => void;
  onSubscription: () => void;
  loading: boolean;
}

const ProfileHeaderActions = ({
  isOwnProfile,
  isFollowing,
  onFollow,
  onMessages,
  onSettings,
  onSubscription,
  loading,
}: ProfileHeaderActionsProps) => {
  if (isOwnProfile) {
    return (
      <>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onMessages}
          className="flex items-center gap-1 text-sm"
        >
          <MessageSquare size={14} /> Messages
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // The onSubscription handler should open the Subscription dialog
            onSubscription();
          }}
          className="flex items-center gap-1 text-sm"
        >
          <BadgeDollarSign size={14} /> Subscription
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSettings}
          className="flex items-center gap-1 text-sm"
        >
          <Settings size={14} /> Settings
        </Button>
      </>
    );
  }
  return (
    <>
      <Button 
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={onFollow}
        className="flex items-center gap-1 text-sm"
      >
        <UserPlus size={14} /> {isFollowing ? "Unfollow" : "Follow"}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onMessages}
        disabled={loading}
        className="flex items-center gap-1 text-sm"
      >
        <MessageSquare size={14} /> Message
      </Button>
    </>
  );
};

export default ProfileHeaderActions;

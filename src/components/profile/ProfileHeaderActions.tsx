import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare } from "lucide-react";

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
  // Removes icons from the three core buttons, keeps logic intact with proper feedback.
  if (isOwnProfile) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={onMessages}
          className="flex items-center gap-1 text-sm"
        >
          Messages
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSubscription}
          className="flex items-center gap-1 text-sm relative"
          disabled={loading}
        >
          {loading && (
            <span className="absolute left-2 animate-spin w-4 h-4 border-2 border-t-transparent border-dream-purple rounded-full" />
          )}
          <span className={loading ? "ml-5" : ""}>Subscription</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          className="flex items-center gap-1 text-sm"
        >
          Settings
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

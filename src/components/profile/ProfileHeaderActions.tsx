
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, MessageCircle, UserPlus, UserMinus } from "lucide-react";
import BlockUserButton from "@/components/moderation/BlockUserButton";

interface ProfileHeaderActionsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  profileToShow: any;
  onEditProfile: () => void;
  onMessages: () => void;
  onSettings: () => void;
  onFollow: () => void;
  onStartConversation: () => void;
}

const ProfileHeaderActions = ({
  isOwnProfile,
  isFollowing,
  profileToShow,
  onEditProfile,
  onMessages,
  onSettings,
  onFollow,
  onStartConversation
}: ProfileHeaderActionsProps) => {
  if (isOwnProfile) {
    return (
      <div className="flex gap-2">
        <Button onClick={onEditProfile} variant="outline" size="sm">
          Edit Profile
        </Button>
        <Button onClick={onMessages} variant="outline" size="sm">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button onClick={onSettings} variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={onFollow}
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        className="flex items-center gap-1"
      >
        {isFollowing ? (
          <>
            <UserMinus className="h-4 w-4" />
            Unfollow
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Follow
          </>
        )}
      </Button>
      
      <Button 
        onClick={onStartConversation}
        variant="outline" 
        size="sm"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      <BlockUserButton
        userToBlock={{
          id: profileToShow.id,
          username: profileToShow.username,
          display_name: profileToShow.display_name
        }}
        variant="outline"
        size="sm"
      />
    </div>
  );
};

export default ProfileHeaderActions;

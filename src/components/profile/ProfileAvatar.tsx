
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl?: string;
  username?: string;
  isOwnProfile: boolean;
  onEdit: () => void;
}

const ProfileAvatar = ({ avatarUrl, username, isOwnProfile, onEdit }: ProfileAvatarProps) => (
  <div className="relative">
    <Avatar className="w-24 h-24 border-4 border-dream-lavender">
      <AvatarImage src={avatarUrl} />
      <AvatarFallback className="bg-dream-purple/20 text-dream-purple">
        {username ? username[0].toUpperCase() : "U"}
      </AvatarFallback>
    </Avatar>
    {isOwnProfile && (
      <Button 
        size="icon" 
        variant="outline" 
        className="absolute bottom-0 right-0 rounded-full bg-white shadow-md p-1 h-8 w-8"
        onClick={onEdit}
      >
        <Edit size={14} />
      </Button>
    )}
  </div>
);

export default ProfileAvatar;

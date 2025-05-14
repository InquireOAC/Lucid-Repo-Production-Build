
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DreamCardUserProps {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  onUserClick: (e: React.MouseEvent) => void;
}

const DreamCardUser = ({ 
  username, 
  displayName, 
  avatarUrl, 
  onUserClick 
}: DreamCardUserProps) => {
  // Show username first (always public), fallback to displayName
  const nameToShow = username || displayName || "User";
  return (
    <div 
      className="flex items-center mb-3 cursor-pointer hover:underline" 
      onClick={onUserClick}
    >
      <Avatar className="h-6 w-6 mr-2">
        <AvatarImage src={avatarUrl} alt={nameToShow} />
        <AvatarFallback>
          {nameToShow.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{nameToShow}</span>
    </div>
  );
};

export default DreamCardUser;

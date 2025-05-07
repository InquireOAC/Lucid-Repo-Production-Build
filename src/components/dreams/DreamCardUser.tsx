
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DreamCardUserProps {
  username: string;
  displayName: string;
  avatarUrl: string;
  onUserClick: (e: React.MouseEvent) => void;
}

const DreamCardUser = ({ 
  username, 
  displayName, 
  avatarUrl, 
  onUserClick 
}: DreamCardUserProps) => {
  return (
    <div 
      className="flex items-center mb-3 cursor-pointer hover:underline" 
      onClick={onUserClick}
    >
      <Avatar className="h-6 w-6 mr-2">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{displayName}</span>
    </div>
  );
};

export default DreamCardUser;

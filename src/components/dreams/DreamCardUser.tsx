
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
  // Add logs to track what we receive as props
  React.useEffect(() => {
    console.log("DreamCardUser props:", { username, displayName, avatarUrl });
  }, [username, displayName, avatarUrl]);
  // Show username if available, then displayName, fallback to "User"
  const nameToShow =
    (username && username !== "Anonymous User" && username !== "")
      ? username
      : (displayName && displayName !== "") 
        ? displayName
        : "User";
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

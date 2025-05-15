import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Change: Accept 'profile' prop instead of username/displayName/avatarUrl
interface DreamCardUserProps {
  profile?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    id?: string;
  };
  onUserClick: (e: React.MouseEvent) => void;
}

const DreamCardUser = ({ 
  profile, 
  onUserClick 
}: DreamCardUserProps) => {
  React.useEffect(() => {
    console.log("DreamCardUser profile prop:", profile);
  }, [profile]);
  
  // Get fields from profile if defined, else fallback
  const username = profile?.username || "";
  const displayName = profile?.display_name || "";
  const avatarUrl = profile?.avatar_url || "";

  let nameToShow: string;
  if (username && username !== "Anonymous User" && username.trim() !== "") {
    nameToShow = username;
  } else if (displayName && displayName.trim() !== "") {
    nameToShow = displayName;
  } else {
    nameToShow = "User";
  }

  if (!profile) {
    console.warn("DreamCardUser: Missing profile prop; falling back to 'User'");
  }

  return (
    <div 
      className="flex items-center mb-3 cursor-pointer hover:underline" 
      onClick={onUserClick}
      data-user-id={profile?.id} // helpful for debugging
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

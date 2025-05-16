import React from "react";
import SymbolAvatar from "../profile/SymbolAvatar";

interface DreamCardUserProps {
  profile?: {
    username?: string;
    display_name?: string;
    avatar_symbol?: string;
    avatar_color?: string;
    id?: string;
  };
  onUserClick: (e: React.MouseEvent) => void;
}

const DreamCardUser = ({
  profile,
  onUserClick,
}: DreamCardUserProps) => {
  const username = profile?.username || "";
  const displayName = profile?.display_name || "";
  const avatarSymbol = profile?.avatar_symbol ?? undefined;
  const avatarColor = profile?.avatar_color ?? undefined;

  let nameToShow: string;
  if (username && username !== "Anonymous User" && username.trim() !== "") {
    nameToShow = username;
  } else if (displayName && displayName.trim() !== "") {
    nameToShow = displayName;
  } else {
    nameToShow = "User";
  }

  return (
    <div
      className="flex items-center mb-3 cursor-pointer hover:underline"
      onClick={onUserClick}
      data-username={username}
    >
      <SymbolAvatar
        symbol={avatarSymbol}
        color={avatarColor}
        fallbackLetter={nameToShow.charAt(0).toUpperCase()}
        size={28}
        className="mr-2"
      />
      <span className="text-sm font-medium">{nameToShow}</span>
    </div>
  );
};

export default DreamCardUser;

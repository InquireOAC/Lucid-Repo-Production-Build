
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
  avatarSymbol?: string; // NEW: explicit prop
  avatarColor?: string;  // NEW: explicit prop
  onUserClick: (e: React.MouseEvent) => void;
}

const DreamCardUser = ({
  profile,
  avatarSymbol,
  avatarColor,
  onUserClick,
}: DreamCardUserProps) => {
  const username = profile?.username || "";
  const displayName = profile?.display_name || "";
  // Prefer explicit avatarSymbol/avatarColor prop, then fallback to profile.
  const symbol = avatarSymbol ?? profile?.avatar_symbol ?? undefined;
  const color = avatarColor ?? profile?.avatar_color ?? undefined;

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
        symbol={symbol}
        color={color}
        fallbackLetter={nameToShow.charAt(0).toUpperCase()}
        size={28}
        className="mr-2"
      />
      <span className="text-sm font-medium">{nameToShow}</span>
    </div>
  );
};

export default DreamCardUser;

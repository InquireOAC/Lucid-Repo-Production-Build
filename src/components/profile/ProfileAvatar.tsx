
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import SymbolAvatar from "./SymbolAvatar";

interface ProfileAvatarProps {
  avatarSymbol?: string | null;
  avatarColor?: string | null;
  username?: string;
  isOwnProfile: boolean;
  onEdit: () => void;
}

export default function ProfileAvatar({
  avatarSymbol,
  avatarColor,
  username,
  isOwnProfile,
  onEdit,
}: ProfileAvatarProps) {
  const fallbackLetter = username ? username[0].toUpperCase() : "U";

  return (
    <div className="relative flex items-center justify-center">
      <SymbolAvatar
        symbol={avatarSymbol}
        color={avatarColor}
        fallbackLetter={fallbackLetter}
        size={96}
        className="shadow-lg border-4 border-dream-lavender"
      />
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
}

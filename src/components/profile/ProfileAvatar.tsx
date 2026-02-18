
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import SymbolAvatar from "./SymbolAvatar";

interface ProfileAvatarProps {
  avatarSymbol?: string | null;
  avatarColor?: string | null;
  avatarUrl?: string | null;
  username?: string;
  isOwnProfile: boolean;
  onEdit: () => void;
}

export default function ProfileAvatar({
  avatarSymbol,
  avatarColor,
  avatarUrl,
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
        avatarUrl={avatarUrl}
        fallbackLetter={fallbackLetter}
        size={96}
        className="shadow-lg border-4 border-dream-lavender"
      />
      {isOwnProfile && (
        <Button
          size="icon"
          variant="outline"
          className="absolute bottom-0 right-0 rounded-full bg-dream-purple/90 shadow-md p-1 h-8 w-8 border-none flex items-center justify-center"
          onClick={onEdit}
          style={{
            background: "#9b87f5",
            border: "none",
          }}
        >
          <Edit size={15} color="#fff" />
        </Button>
      )}
    </div>
  );
}

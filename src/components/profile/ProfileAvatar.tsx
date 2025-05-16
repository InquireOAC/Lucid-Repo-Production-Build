
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { 
  Star, Moon, Sun, Cloud, Eye, 
  Crystal, Comet, Galaxy 
} from "lucide-react";

const SymbolComponents: Record<string, React.ElementType> = {
  star: Star,
  moon: Moon,
  sun: Sun,
  cloud: Cloud,
  crystal: Crystal,
  comet: Comet,
  galaxy: Galaxy,
  eye: Eye
};

interface ProfileAvatarProps {
  avatarSymbol?: string | null;
  avatarColor?: string | null;
  username?: string;
  isOwnProfile: boolean;
  onEdit: () => void;
}

const fallbackColor = "#9b87f5";

export default function ProfileAvatar({
  avatarSymbol,
  avatarColor,
  username,
  isOwnProfile,
  onEdit
}: ProfileAvatarProps) {
  const SymbolIcon = avatarSymbol && SymbolComponents[avatarSymbol]
    ? SymbolComponents[avatarSymbol]
    : Star;

  const color = avatarColor || fallbackColor;
  const fallbackLetter = username ? username[0].toUpperCase() : "U";

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-dream-lavender bg-white shadow">
        {SymbolIcon ? (
          <SymbolIcon size={68} color={color} />
        ) : (
          <span className="text-4xl" style={{ color }}>{fallbackLetter}</span>
        )}
      </div>
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

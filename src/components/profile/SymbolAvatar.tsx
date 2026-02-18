
import React from "react";
import { Star, Moon, Sun, Cloud, Eye } from "lucide-react";
import { IoMdPlanet } from "react-icons/io";
import { GiGalaxy } from "react-icons/gi";
import { PiShootingStarFill } from "react-icons/pi";

const SymbolComponents: Record<string, React.ElementType> = {
  star: Star,
  moon: Moon,
  sun: Sun,
  cloud: Cloud,
  planet: IoMdPlanet,
  galaxy: GiGalaxy,
  shootingstar: PiShootingStarFill,
  eye: Eye
};

interface SymbolAvatarProps {
  symbol?: string | null;
  color?: string | null;
  fallbackLetter?: string;
  size?: number;
  className?: string;
  avatarUrl?: string | null;
}

const fallbackColor = "#9b87f5";

export default function SymbolAvatar({
  symbol,
  color,
  fallbackLetter = "U",
  size = 40,
  className = "",
  avatarUrl,
}: SymbolAvatarProps) {
  // If the user has set a photo/dream avatar as their avatar, display it
  if (avatarUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-full overflow-hidden border-2 border-dream-lavender ${className}`}
        style={{ width: size, height: size, flexShrink: 0 }}
      >
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const SymbolIcon =
    symbol && SymbolComponents[symbol.toLowerCase()]
      ? SymbolComponents[symbol.toLowerCase()]
      : Star;
  const iconColor = color || fallbackColor;

  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-dream-lavender glass ${className}`}
      style={{
        width: size,
        height: size,
        background: "transparent",
      }}
    >
      {SymbolIcon ? (
        <SymbolIcon size={size * 0.8} color={iconColor} />
      ) : (
        <span className="font-bold text-xl" style={{ color: iconColor }}>
          {fallbackLetter}
        </span>
      )}
    </div>
  );
}

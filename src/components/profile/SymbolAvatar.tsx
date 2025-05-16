
import React from "react";
import { Star, Moon, Sun, Cloud, Eye, ArrowDown, ArrowUp, ArrowRight } from "lucide-react";

const SymbolComponents: Record<string, React.ElementType> = {
  star: Star,
  moon: Moon,
  sun: Sun,
  cloud: Cloud,
  arrowdown: ArrowDown,
  arrowup: ArrowUp,
  arrowright: ArrowRight,
  eye: Eye
};

interface SymbolAvatarProps {
  symbol?: string | null;
  color?: string | null;
  fallbackLetter?: string;
  size?: number;
  className?: string;
}

const fallbackColor = "#9b87f5";

export default function SymbolAvatar({
  symbol,
  color,
  fallbackLetter = "U",
  size = 40,
  className = "",
}: SymbolAvatarProps) {
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
        background: "transparent", // Ensures true transparency
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

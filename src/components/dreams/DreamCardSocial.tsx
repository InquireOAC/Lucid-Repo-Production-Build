import React, { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DreamCardSocialProps {
  isPublic?: boolean;
  liked?: boolean;
  onLike?: () => void;
}

const DreamCardSocial = ({
  isPublic,
  liked,
  onLike
}: DreamCardSocialProps) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  
  if (!isPublic) return null;
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikeAnimating(true);
    onLike?.();
    setTimeout(() => setIsLikeAnimating(false), 500);
  };
  
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
      <button
        className={cn(
          "flex items-center gap-1 hover:text-gray-700 transition-colors",
          liked ? "text-red-500" : "text-muted-foreground"
        )}
        onClick={handleLikeClick}
        aria-label="Like dream"
      >
        <Heart
          size={14}
          className={cn(
            "transition-all duration-300",
            liked ? "fill-red-500 stroke-red-500" : "",
            isLikeAnimating ? "scale-150" : liked ? "scale-110" : "scale-100"
          )}
        />
      </button>
    </div>
  );
};

export default DreamCardSocial;

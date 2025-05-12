
import React, { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DreamCardSocialProps {
  isPublic?: boolean;
  likeCount: number;
  commentCount: number;
  liked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
}

const DreamCardSocial = ({ 
  isPublic, 
  likeCount, 
  commentCount, 
  liked, 
  onLike,
  onComment
}: DreamCardSocialProps) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  
  if (!isPublic) return null;
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikeAnimating(true);
    onLike?.();
    setTimeout(() => setIsLikeAnimating(false), 500);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.();
  };
  
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
      <button 
        className={cn(
          "flex items-center gap-1 hover:text-gray-700 transition-colors", 
          liked ? "text-red-500" : "text-muted-foreground"
        )}
        onClick={handleLikeClick}
      >
        <Heart 
          size={14} 
          className={cn(
            "transition-all duration-300", 
            liked ? "fill-red-500 stroke-red-500" : "",
            isLikeAnimating ? "scale-150" : liked ? "scale-110" : "scale-100"
          )} 
        />
        <span>{likeCount}</span>
      </button>
      <button 
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
        onClick={handleCommentClick}
      >
        <MessageCircle size={14} className="mr-1" />
        <span>{commentCount || 0}</span>
      </button>
    </div>
  );
};

export default DreamCardSocial;

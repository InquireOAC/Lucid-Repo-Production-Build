
import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DreamCardSocialProps {
  isPublic?: boolean;
  likeCount: number;
  commentCount: number;
  liked?: boolean;
  onLike?: () => void;
}

const DreamCardSocial = ({ 
  isPublic, 
  likeCount, 
  commentCount, 
  liked, 
  onLike 
}: DreamCardSocialProps) => {
  if (!isPublic) return null;
  
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
      <button 
        className={cn(
          "flex items-center gap-1 hover:text-gray-700 transition-colors", 
          liked ? "text-red-500" : "text-muted-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onLike?.();
        }}
      >
        <Heart 
          size={14} 
          className={cn(
            "transition-all", 
            liked ? "fill-red-500 stroke-red-500 scale-110" : ""
          )} 
        />
        <span>{likeCount}</span>
      </button>
      <div className="flex items-center">
        <MessageCircle size={14} className="mr-1" />
        <span>{commentCount || 0}</span>
      </div>
    </div>
  );
};

export default DreamCardSocial;

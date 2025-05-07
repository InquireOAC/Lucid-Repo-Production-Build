
import React from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
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
    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <div 
          className={cn("flex items-center cursor-pointer", liked && "text-red-500")}
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
        >
          <Heart size={12} className="mr-1" />
          <span>{likeCount}</span>
        </div>
        <div className="flex items-center">
          <MessageCircle size={12} className="mr-1" />
          <span>{commentCount || 0}</span>
        </div>
      </div>
      <div className="flex items-center">
        <Share2 size={14} />
      </div>
    </div>
  );
};

export default DreamCardSocial;

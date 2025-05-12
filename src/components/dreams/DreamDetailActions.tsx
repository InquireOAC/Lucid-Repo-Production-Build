
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DreamDetailActionsProps {
  isAuthenticated?: boolean;
  isPublic?: boolean;
  onTogglePublic?: () => void;
  onLike?: () => void; // Add this line
  liked?: boolean; // Add this line
  likeCount?: number; // Add this line
}

const DreamDetailActions = ({ 
  isAuthenticated, 
  isPublic,
  onTogglePublic,
  onLike,
  liked,
  likeCount = 0
}: DreamDetailActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Like button */}
      {isPublic && isAuthenticated && onLike && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className={cn(
            "flex items-center gap-1", 
            liked ? "text-red-500" : ""
          )}
        >
          <Heart 
            size={16} 
            className={cn(
              liked ? "fill-red-500" : ""
            )} 
          />
          <span>{likeCount}</span>
        </Button>
      )}

      {/* Toggle Public/Private button (only for dream owner) */}
      {onTogglePublic && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onTogglePublic}
        >
          {isPublic ? (
            <>
              <Unlock size={16} className="mr-1" />
              Public
            </>
          ) : (
            <>
              <Lock size={16} className="mr-1" />
              Private
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default DreamDetailActions;

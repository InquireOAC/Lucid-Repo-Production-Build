
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Moon } from "lucide-react";
import { DreamEntry } from "@/types/dream";
import { cn } from "@/lib/utils";

interface DreamCardProps {
  dream: DreamEntry;
  onLike?: () => void;
  showUser?: boolean;
  onClick?: () => void;
  onUserClick?: () => void;
}

const DreamCard = ({ dream, onLike, showUser = false, onClick, onUserClick }: DreamCardProps) => {
  const formattedDate = format(new Date(dream.date), "MMM d, yyyy");
  
  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;
  
  // Use either likeCount or like_count, ensuring we have a consistent value
  const likeCount = typeof dream.likeCount !== 'undefined' ? dream.likeCount : (dream.like_count || 0);
  
  // Similarly handle comment count
  const commentCount = typeof dream.commentCount !== 'undefined' ? dream.commentCount : (dream.comment_count || 0);

  // Get user info from profiles if available
  const username = dream.profiles?.username || "Anonymous";
  const displayName = dream.profiles?.display_name || "Anonymous User";
  const avatarUrl = dream.profiles?.avatar_url || "";

  const handleUserClick = (e: React.MouseEvent) => {
    if (onUserClick) {
      e.stopPropagation();
      onUserClick();
    }
  };

  return (
    <Card 
      className="dream-card h-full cursor-pointer hover:scale-[1.02] transition-all"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg gradient-text font-bold line-clamp-1">
            {dream.title}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground">
            <Moon size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {showUser && (
          <div 
            className="flex items-center mb-3 cursor-pointer hover:underline" 
            onClick={handleUserClick}
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{displayName}</span>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {dream.content}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {dream.lucid && (
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-dream-lavender/20 text-dream-lavender"
            >
              Lucid
            </Badge>
          )}
        </div>
        
        {dream.generatedImage && (
          <div className="mt-2 h-20 w-full overflow-hidden rounded-md">
            <img
              src={dream.generatedImage}
              alt="Dream visualization"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        {/* Show social stats if dream is public */}
        {isPublic && (
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <div className={cn("flex items-center", dream.liked && "text-red-500")}>
              <Heart size={12} className="mr-1" />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center">
              <MessageCircle size={12} className="mr-1" />
              <span>{commentCount || 0}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamCard;

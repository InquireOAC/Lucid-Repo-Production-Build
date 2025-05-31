
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { formatDistanceToNow } from "date-fns";
import DreamCardUser from "./DreamCardUser";
import FlagButton from "@/components/moderation/FlagButton";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface DreamCardProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onComment?: (dreamId: string) => void;
  onShare?: (dreamId: string) => void;
  onCardClick?: (dream: DreamEntry) => void;
  onUserClick?: (username: string) => void;
  onTagClick?: (tagId: string) => void;
  currentUser?: any;
  showUserInfo?: boolean;
}

const DreamCard = ({
  dream,
  tags,
  onLike,
  onComment,
  onShare,
  onCardClick,
  onUserClick,
  onTagClick,
  currentUser,
  showUserInfo = true
}: DreamCardProps) => {
  const { isUserBlocked } = useBlockedUsers();
  
  // Don't render if the dream's author is blocked
  if (isUserBlocked(dream.user_id)) {
    return null;
  }

  const dreamTags = Array.isArray(dream.tags) 
    ? dream.tags.map(tagId => tags.find(t => t.id === tagId)).filter(Boolean)
    : [];

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(dream);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer dream-card"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showUserInfo && (
              <DreamCardUser
                dream={dream}
                onUserClick={onUserClick}
              />
            )}
            <h3 className="font-semibold text-lg leading-tight">{dream.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {formatDistanceToNow(new Date(dream.created_at))} ago
            </p>
          </div>
          
          {/* Flag button for inappropriate content */}
          {currentUser && currentUser.id !== dream.user_id && (
            <div onClick={(e) => e.stopPropagation()}>
              <FlagButton
                contentType="dream"
                contentId={dream.id}
                contentOwnerId={dream.user_id}
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm line-clamp-3 mb-3">{dream.content}</p>
        
        {dream.generatedImage && (
          <div className="mb-3">
            <img 
              src={dream.generatedImage} 
              alt="Dream visualization" 
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        
        {dreamTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dreamTags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs cursor-pointer"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                onClick={(e) => handleButtonClick(e, () => onTagClick?.(tag.id))}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:text-red-500"
              onClick={(e) => handleButtonClick(e, () => onLike(dream.id))}
            >
              <Heart className="h-4 w-4 mr-1" />
              {dream.likeCount || 0}
            </Button>
            
            {onComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:text-blue-500"
                onClick={(e) => handleButtonClick(e, () => onComment(dream.id))}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {dream.commentCount || 0}
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:text-green-500"
                onClick={(e) => handleButtonClick(e, () => onShare(dream.id))}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
          </div>
          
          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {dream.view_count || 0}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DreamCard;

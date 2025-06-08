
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
  dreamTags?: string[]; // Made optional since it's passed from some components
  onLike: (dreamId: string) => void;
  onComment?: (dreamId: string) => void;
  onShare?: (dreamId: string) => void;
  onCardClick?: (dream: DreamEntry) => void;
  onClick?: () => void; // Alternative click handler
  onUserClick?: (username: string) => void;
  onTagClick?: (tagId: string) => void;
  currentUser?: any;
  showUserInfo?: boolean;
  showUser?: boolean; // Alternative prop name used by some components
  showSharedBadge?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onTogglePublic?: () => void;
  onDelete?: () => void;
}

const DreamCard = ({
  dream,
  tags,
  dreamTags,
  onLike,
  onComment,
  onShare,
  onCardClick,
  onClick,
  onUserClick,
  onTagClick,
  currentUser,
  showUserInfo = true,
  showUser = true,
  showSharedBadge = false,
  showActions = false,
  onEdit,
  onTogglePublic,
  onDelete
}: DreamCardProps) => {
  const { isUserBlocked } = useBlockedUsers();
  
  // Don't render if the dream's author is blocked
  if (isUserBlocked(dream.user_id)) {
    return null;
  }

  // Use dreamTags if provided, otherwise fall back to dream.tags
  const tagIdList: string[] = dreamTags ?? dream.tags ?? [];
  const mappedTags = tagIdList
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean) as DreamTag[];

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(dream);
    } else if (onClick) {
      onClick();
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUserClick && dream.profiles?.username) {
      onUserClick(dream.profiles.username);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Use created_at if available, otherwise fall back to date
  const dateToFormat = dream.created_at || dream.date;
  const formattedDate = formatDistanceToNow(new Date(dateToFormat)) + " ago";

  // Determine if this is a journal view (compact layout)
  const isJournalView = !showUserInfo && !showUser;

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer dream-card ${
        isJournalView ? 'h-fit' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className={isJournalView ? "pb-1 p-3" : "pb-3"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {(showUserInfo || showUser) && (
              <DreamCardUser
                profile={dream.profiles}
                onUserClick={handleUserClick}
              />
            )}
            <h3 className={`font-semibold leading-tight ${
              isJournalView ? 'text-sm mb-1' : 'text-lg'
            }`}>{dream.title}</h3>
            <p className={`text-muted-foreground ${
              isJournalView ? 'text-xs' : 'text-sm mt-1'
            }`}>
              {formattedDate}
            </p>
          </div>
          
          {/* Flag button for inappropriate content - only show if not journal view and user is logged in and not own dream */}
          {!isJournalView && currentUser && currentUser.id !== dream.user_id && (
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <FlagButton
                contentType="dream"
                contentId={dream.id}
                contentOwnerId={dream.user_id}
                size="sm"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={isJournalView ? "pt-0 p-3" : "pt-0"}>
        <p className={`line-clamp-2 mb-2 ${
          isJournalView ? 'text-xs' : 'text-sm'
        }`}>{dream.content}</p>
        
        {dream.generatedImage && (
          <div className={isJournalView ? "mb-2" : "mb-3"}>
            <img 
              src={dream.generatedImage} 
              alt="Dream visualization" 
              className={`w-full object-cover rounded-md ${
                isJournalView ? 'h-20' : 'h-32'
              }`}
            />
          </div>
        )}
        
        {mappedTags.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isJournalView ? 'mb-2' : 'mb-3'}`}>
            {mappedTags.slice(0, isJournalView ? 3 : mappedTags.length).map((tag) => (
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
            {isJournalView && mappedTags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{mappedTags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {showSharedBadge && (dream.is_public || dream.isPublic) && (
          <Badge variant="outline" className={isJournalView ? "mb-2 text-xs" : "mb-3"}>Public</Badge>
        )}

        {showActions && (
          <div className={`flex gap-1 ${isJournalView ? 'mb-2' : 'mb-3'}`}>
            {onEdit && (
              <Button variant="outline" size={isJournalView ? "xs" : "sm"} onClick={(e) => handleButtonClick(e, onEdit)}>
                Edit
              </Button>
            )}
            {onTogglePublic && (
              <Button variant="outline" size={isJournalView ? "xs" : "sm"} onClick={(e) => handleButtonClick(e, onTogglePublic)}>
                {dream.is_public || dream.isPublic ? 'Private' : 'Public'}
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size={isJournalView ? "xs" : "sm"} onClick={(e) => handleButtonClick(e, onDelete)}>
                Delete
              </Button>
            )}
          </div>
        )}
        
        <div className={`flex items-center justify-between text-muted-foreground ${
          isJournalView ? 'text-xs' : 'text-sm'
        }`}>
          <div className="flex items-center gap-3">
            {/* Display-only like counter - visible to ALL users */}
            <div className="flex items-center gap-1">
              <Heart className={`${isJournalView ? 'h-3 w-3' : 'h-4 w-4'} ${dream.liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{dream.likeCount || dream.like_count || 0}</span>
            </div>
            
            {onComment && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto p-1 hover:text-blue-500 ${isJournalView ? 'text-xs' : ''}`}
                onClick={(e) => handleButtonClick(e, () => onComment(dream.id))}
              >
                <MessageCircle className={`mr-1 ${isJournalView ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {dream.commentCount || dream.comment_count || 0}
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto p-1 hover:text-green-500 ${isJournalView ? 'text-xs' : ''}`}
                onClick={(e) => handleButtonClick(e, () => onShare(dream.id))}
              >
                <Share2 className={`mr-1 ${isJournalView ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Share
              </Button>
            )}
          </div>
          
          {/* View counter - visible to ALL users */}
          <div className="flex items-center">
            <Eye className={`mr-1 ${isJournalView ? 'h-2 w-2' : 'h-3 w-3'}`} />
            <span>{dream.view_count || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DreamCard;

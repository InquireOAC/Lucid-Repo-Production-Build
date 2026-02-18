
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Volume2 } from "lucide-react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { formatDistanceToNow } from "date-fns";
import DreamCardUser from "./DreamCardUser";
import FlagButton from "@/components/moderation/FlagButton";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { AudioPlayer } from "./AudioPlayer";

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
  const mappedTags = tagIdList.
  map((tagId) => tags.find((tag) => tag.id === tagId)).
  filter(Boolean) as DreamTag[];

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

  // Debug logging for audio
  console.log('DreamCard audio debug:', {
    dreamId: dream.id,
    audio_url: dream.audio_url,
    audioUrl: dream.audioUrl,
    hasAudio: !!(dream.audio_url || dream.audioUrl)
  });

  return (
    <Card
      className="hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer luminous-card oniri-hover border-primary/10 group"
      onClick={handleCardClick}>

      <div className="geometric-bg absolute inset-0 rounded-lg opacity-20"></div>
      <CardHeader className={`${isJournalView ? "pb-2 p-4" : "pb-3"} relative z-10`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {(showUserInfo || showUser) &&
            <DreamCardUser
              profile={dream.profiles}
              onUserClick={handleUserClick} />

            }
            <h3 className={`font-bold leading-tight text-white ${
            isJournalView ? 'text-base mb-1' : 'text-lg'}`
            }>{dream.title}</h3>
            <p className={`text-white/60 ${
            isJournalView ? 'text-xs' : 'text-sm mt-1'}`
            }>
              {formattedDate}
            </p>
          </div>
          
          {/* Flag button for inappropriate content - only show if not journal view and user is logged in and not own dream */}
          {!isJournalView && currentUser && currentUser.id !== dream.user_id &&
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <FlagButton
              contentType="dream"
              contentId={dream.id}
              contentOwnerId={dream.user_id}
              size="sm" />

            </div>
          }
        </div>
      </CardHeader>
      
      <CardContent className={`${isJournalView ? "pt-0 p-4" : "pt-0"} relative z-10`}>
        <p className={`line-clamp-2 mb-3 text-white/80 ${
        isJournalView ? 'text-xs' : 'text-sm'}`
        }>{dream.content}</p>

        {/* Audio Player */}
        {(dream.audio_url || dream.audioUrl) &&
        <div className={`${isJournalView ? "mb-2" : "mb-3"}`}>
            <div className="flex items-center gap-2 mb-2 text-white/70">
              <Volume2 className={`${isJournalView ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className={`font-medium ${isJournalView ? 'text-xs' : 'text-sm'}`}>
                Voice Recording
              </span>
            </div>
            <AudioPlayer
            audioUrl={dream.audio_url || dream.audioUrl}
            title="Dream Recording"
            compact={isJournalView} />

          </div>
        }
        
        {dream.generatedImage &&
        <div className={`${isJournalView ? "mb-2" : "mb-3"} relative`}>
            <img
            src={dream.generatedImage}
            alt="Dream visualization"
            className={`w-full object-cover rounded-lg shadow-lg ${
            isJournalView ? 'h-24' : 'h-48'}`
            } />

            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        }
        
        {mappedTags.length > 0 &&
        <div className={`flex flex-wrap gap-2 ${isJournalView ? 'mb-2' : 'mb-3'}`}>
          {mappedTags.slice(0, isJournalView ? 3 : mappedTags.length).map((tag) =>
          <Badge
            key={tag.id}
            className="text-xs cursor-pointer bg-primary/15 hover:bg-primary/25 text-primary border-primary/30 transition-all duration-200"
            onClick={(e) => handleButtonClick(e, () => onTagClick?.(tag.id))}>

                {tag.name}
              </Badge>
          )}
            {isJournalView && mappedTags.length > 3 &&
          <Badge className="text-xs bg-primary/10 text-primary/70 border-primary/20">
                +{mappedTags.length - 3}
              </Badge>
          }
          </div>
        }

        {showSharedBadge && (dream.is_public || dream.isPublic) &&
        <Badge className={`${isJournalView ? "mb-2 text-xs" : "mb-3"} bg-primary/20 text-primary border-primary/30`}>
            Public
          </Badge>
        }

        {showActions &&
        <div className={`flex gap-2 ${isJournalView ? 'mb-2' : 'mb-3'}`}>
            {onEdit &&
          <Button
            variant="outline"
            size={isJournalView ? "sm" : "sm"}
            className="bg-primary/10 hover:bg-primary/20 border-primary/30 hover:border-primary/50 text-slate-300"
            onClick={(e) => handleButtonClick(e, onEdit)}>

                Edit
              </Button>
          }
            {onTogglePublic &&
          <Button
            variant="outline"
            size={isJournalView ? "sm" : "sm"}
            className="bg-primary/10 hover:bg-primary/20 border-primary/30 hover:border-primary/50 text-slate-200"
            onClick={(e) => handleButtonClick(e, onTogglePublic)}>

                {dream.is_public || dream.isPublic ? 'Private' : 'Public'}
              </Button>
          }
            {onDelete &&
          <Button
            variant="destructive"
            size={isJournalView ? "sm" : "sm"}
            className="bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground border-destructive/30"
            onClick={(e) => handleButtonClick(e, onDelete)}>

                Delete
              </Button>
          }
          </div>
        }
        
        <div className={`flex items-center gap-4 text-white/60 ${
        isJournalView ? 'text-xs' : 'text-sm'}`
        }>
          {/* Display-only like counter - visible to ALL users */}
          <div className="flex items-center gap-2">
            <Heart className={`${isJournalView ? 'h-3 w-3' : 'h-4 w-4'} ${dream.liked ? 'fill-red-400 text-red-400' : 'text-white/60'}`} />
            <span className="text-white/70">{dream.likeCount || dream.like_count || 0}</span>
          </div>
          
          {/* Comment counter - clickable to open comments */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-auto p-1 hover:text-blue-300 text-white/60 hover:bg-white/10 ${isJournalView ? 'text-xs' : ''}`}
            onClick={(e) => handleButtonClick(e, () => onComment?.(dream.id))}>

            <MessageCircle className={`mr-1 ${isJournalView ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {dream.commentCount || dream.comment_count || 0}
          </Button>
          
          {onShare &&
          <Button
            variant="ghost"
            size="sm"
            className={`h-auto p-1 hover:text-green-300 text-white/60 hover:bg-white/10 ${isJournalView ? 'text-xs' : ''}`}
            onClick={(e) => handleButtonClick(e, () => onShare(dream.id))}>

              <Share2 className={`mr-1 ${isJournalView ? 'h-3 w-3' : 'h-4 w-4'}`} />
              Share
            </Button>
          }
        </div>
      </CardContent>
    </Card>);

};

export default DreamCard;
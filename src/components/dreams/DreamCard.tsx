
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamCardUser from "./DreamCardUser";
import DreamCardTags from "./DreamCardTags";
import DreamCardSocial from "./DreamCardSocial";

interface DreamCardProps {
  dream: DreamEntry;
  tags?: DreamTag[];
  onLike?: () => void;
  showUser?: boolean;
  onClick?: () => void;
  onUserClick?: () => void;
  onTagClick?: (tagId: string) => void;
}

const DreamCard = ({ 
  dream, 
  tags = [], 
  onLike, 
  showUser = false, 
  onClick, 
  onUserClick,
  onTagClick
}: DreamCardProps) => {
  const formattedDate = format(new Date(dream.date), "MMM d, yyyy");
  // State to track audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;
  
  // Use either likeCount or like_count, ensuring we have a consistent value
  const likeCount = typeof dream.likeCount !== 'undefined' ? dream.likeCount : (dream.like_count || 0);
  
  // Similarly handle comment count
  const commentCount = typeof dream.commentCount !== 'undefined' ? dream.commentCount : (dream.comment_count || 0);

  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;

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
  
  // Handle audio playback
  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!audioUrl) return;
    
    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
        });
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card 
      className="dream-card h-full cursor-pointer transition-all"
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
          <DreamCardUser
            username={username}
            displayName={displayName}
            avatarUrl={avatarUrl}
            onUserClick={handleUserClick}
          />
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {dream.content}
        </p>
        
        <DreamCardTags
          tags={tags}
          dreamTags={dream.tags}
          lucid={dream.lucid}
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          onTagClick={onTagClick}
          onToggleAudio={toggleAudio}
        />
        
        {dream.generatedImage && (
          <div className="mt-2 h-20 w-full overflow-hidden rounded-md">
            <img
              src={dream.generatedImage}
              alt="Dream visualization"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <DreamCardSocial
          isPublic={isPublic}
          likeCount={likeCount}
          commentCount={commentCount}
          liked={dream.liked}
          onLike={onLike}
        />
      </CardContent>
    </Card>
  );
};

export default DreamCard;

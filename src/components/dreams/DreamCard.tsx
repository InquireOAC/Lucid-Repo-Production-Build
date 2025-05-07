
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Globe } from "lucide-react";
import { toast } from "sonner";
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
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

const DreamCard = ({ 
  dream, 
  tags = [], 
  onLike, 
  showUser = false, 
  onClick, 
  onUserClick,
  onTagClick,
  isAudioPlaying = false,
  onToggleAudio
}: DreamCardProps) => {
  // Format the dream date
  const formattedDate = dream.date ? format(new Date(dream.date), "MMM d, yyyy") : "No date";
  
  // State to track audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Effect to sync local playing state with prop
  useEffect(() => {
    setIsPlaying(isAudioPlaying || false);
    
    if (isAudioPlaying && audioUrl && !isPlaying) {
      playAudio();
    } else if (!isAudioPlaying && isPlaying) {
      pauseAudio();
    }
  }, [isAudioPlaying, audioUrl]);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleUserClick = (e: React.MouseEvent) => {
    if (onUserClick) {
      e.stopPropagation();
      onUserClick();
    }
  };
  
  // Create audio element and play
  const playAudio = () => {
    if (!audioUrl) {
      toast.error("No audio recording available");
      return;
    }
    
    try {
      if (!audioRef.current) {
        console.log("Creating new audio element with URL:", audioUrl);
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          if (onToggleAudio) onToggleAudio();
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Error playing audio:', e);
          toast.error("Could not play audio recording");
          setIsPlaying(false);
          if (onToggleAudio) onToggleAudio();
        });
        
        audioRef.current = audio;
      }
      
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error("Could not play audio recording");
        setIsPlaying(false);
        if (onToggleAudio) onToggleAudio();
      });
    } catch (err) {
      console.error('Exception playing audio:', err);
      toast.error("Could not play audio recording");
      setIsPlaying(false);
      if (onToggleAudio) onToggleAudio();
    }
  };
  
  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  
  // Handle audio playback
  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (onToggleAudio) {
      onToggleAudio();
    } else {
      // Fallback for direct control if external handler isn't provided
      if (isPlaying) {
        pauseAudio();
        setIsPlaying(false);
      } else {
        playAudio();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card 
      className="dream-card h-full cursor-pointer transition-all relative"
      onClick={onClick}
    >
      {/* Shared badge - adjusted position to be slightly higher in the middle right */}
      {(dream.is_public || dream.isPublic) && (
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 -translate-y-10 z-10">
          <div className="bg-dream-purple text-white text-xs py-1 px-2 rounded-l-md flex items-center gap-1">
            <Globe size={12} /> Shared
          </div>
        </div>
      )}
      
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

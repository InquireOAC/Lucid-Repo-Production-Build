
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Heart, Play, Pause } from "lucide-react";
import { DreamEntry, DreamTag } from "@/types/dream";

interface DreamCardProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClick: () => void;
  onTagClick?: (tagId: string) => void;
}

const DreamCard = ({ dream, tags, onClick, onTagClick }: DreamCardProps) => {
  const formattedDate = format(new Date(dream.date), "MMM d, yyyy");
  const dreamTags = dream.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as DreamTag[];

  // New state to track audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;
  
  // Use either likeCount or like_count, ensuring we have a consistent value
  const likeCount = typeof dream.likeCount !== 'undefined' ? dream.likeCount : (dream.like_count || 0);
  
  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;
  
  // Handle tag click without propagating to the card
  const handleTagClick = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tagId);
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
      className="dream-card cursor-pointer transition-all"
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
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {dream.content}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {dreamTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color + "40", color: tag.color }}
              className="text-xs font-normal border cursor-pointer hover:opacity-80"
              onClick={(e) => handleTagClick(e, tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
          {dream.lucid && (
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-dream-lavender/20 text-dream-lavender"
            >
              Lucid
            </Badge>
          )}
          {audioUrl && (
            <Badge
              variant="outline"
              className={`text-xs font-normal cursor-pointer flex items-center gap-1 ${
                isPlaying ? "bg-green-500/20 text-green-600 border-green-500" : "bg-blue-500/10 text-blue-600 border-blue-400"
              }`}
              onClick={toggleAudio}
            >
              {isPlaying ? (
                <>
                  <Pause size={10} /> Pause Audio
                </>
              ) : (
                <>
                  <Play size={10} /> Play Audio
                </>
              )}
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
        
        {/* Show like count if dream is public */}
        {isPublic && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <Heart size={12} className="mr-1" />
            <span>{likeCount} likes</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamCard;

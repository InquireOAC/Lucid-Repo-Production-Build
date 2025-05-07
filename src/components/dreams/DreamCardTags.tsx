
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume, VolumeX } from "lucide-react";
import { DreamTag } from "@/types/dream";

interface DreamCardTagsProps {
  tags: DreamTag[];
  dreamTags: string[];
  lucid: boolean;
  audioUrl?: string;
  isPlaying: boolean;
  onTagClick?: (tagId: string) => void;
  onToggleAudio: (e: React.MouseEvent) => void;
}

const DreamCardTags = ({
  tags,
  dreamTags,
  lucid,
  audioUrl,
  isPlaying,
  onTagClick,
  onToggleAudio
}: DreamCardTagsProps) => {
  // Get dream tags if we have tag data
  const displayTags = tags?.length && dreamTags ? 
    dreamTags
      .map(tagId => tags.find(t => t.id === tagId))
      .filter(Boolean) as DreamTag[] 
    : [];

  // Handle tag click
  const handleTagClick = (e: React.MouseEvent, tagId: string) => {
    if (onTagClick) {
      e.stopPropagation();
      onTagClick(tagId);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {/* Render tags if we have them */}
      {displayTags.map(tag => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color + "40", color: tag.color }}
          className="text-xs font-normal border cursor-pointer hover:opacity-80"
          onClick={(e) => handleTagClick(e, tag.id)}
        >
          {tag.name}
        </Badge>
      ))}
      
      {lucid && (
        <Badge
          variant="secondary"
          className="text-xs font-normal bg-dream-lavender/20 text-dream-lavender"
        >
          Lucid
        </Badge>
      )}
      
      {audioUrl && (
        <div className="mt-1 w-full">
          <Button
            variant="outline"
            size="sm"
            className={`w-full flex items-center justify-center gap-1 ${
              isPlaying ? "bg-green-500/10 text-green-600 border-green-400" : "bg-blue-500/10 text-blue-600 border-blue-400"
            }`}
            onClick={onToggleAudio}
          >
            {isPlaying ? (
              <>
                <Pause size={16} /> Pause Audio
              </>
            ) : (
              <>
                <Play size={16} /> Play Audio
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DreamCardTags;

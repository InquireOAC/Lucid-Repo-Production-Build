
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
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
        <Badge
          variant="outline"
          className={`text-xs font-normal cursor-pointer flex items-center gap-1 ${
            isPlaying ? "bg-green-500/20 text-green-600 border-green-500" : "bg-blue-500/10 text-blue-600 border-blue-400"
          }`}
          onClick={onToggleAudio}
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
  );
};

export default DreamCardTags;

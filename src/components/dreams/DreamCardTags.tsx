
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DreamTag } from "@/types/dream";

interface DreamCardTagsProps {
  tags?: DreamTag[];
  dreamTags?: string[];
  lucid?: boolean;
  audioUrl?: string;
  isPlaying?: boolean;
  onTagClick?: (tagId: string) => void;
  onToggleAudio?: (e: React.MouseEvent) => void;
}

const DreamCardTags = ({
  tags = [],
  dreamTags = [],
  lucid,
  audioUrl,
  isPlaying,
  onTagClick,
  onToggleAudio,
}: DreamCardTagsProps) => {
  // Find tag data from the supplied tags array
  const tagData = dreamTags
    ? tags.filter((tag) => dreamTags.includes(tag.id))
    : [];

  // Get available tag colors
  const getTagColor = (index: number) => {
    const colors = [
      "bg-blue-500/20 text-blue-500",
      "bg-green-500/20 text-green-500",
      "bg-purple-500/20 text-purple-500",
      "bg-amber-500/20 text-amber-500",
      "bg-pink-500/20 text-pink-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex flex-wrap gap-1 items-center">
        {lucid && (
          <Badge
            variant="outline"
            className="bg-dream-purple/20 text-dream-purple text-xs"
          >
            Lucid
          </Badge>
        )}
        
        {tagData.map((tag, index) => (
          <Badge
            key={tag.id}
            variant="outline"
            className={cn(
              "text-xs cursor-pointer",
              getTagColor(index)
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (onTagClick) onTagClick(tag.id);
            }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      
      {audioUrl && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleAudio}
          className="h-6 w-6 p-0.5 rounded-full"
        >
          {isPlaying ? (
            <Pause size={16} className="text-dream-purple" />
          ) : (
            <Play size={16} className="text-dream-purple" />
          )}
        </Button>
      )}
    </div>
  );
};

export default DreamCardTags;

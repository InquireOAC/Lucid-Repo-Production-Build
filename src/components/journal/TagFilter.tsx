
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DreamTag } from "@/types/dream";

interface TagFilterProps {
  tags: DreamTag[];
  activeTags: string[];
  onTagClick: (tagId: string) => void;
  onClearTags: () => void;
}

const TagFilter = ({ tags, activeTags, onTagClick, onClearTags }: TagFilterProps) => {
  if (tags.length === 0) return null;

  return (
    <div className="mb-4 overflow-x-auto pb-2">
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Filter by:
        </span>
        <div className="flex gap-2 items-center">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              style={{
                backgroundColor: activeTags.includes(tag.id) ? tag.color : tag.color + "40",
                color: activeTags.includes(tag.id) ? "#fff" : tag.color,
              }}
              className="cursor-pointer transition-colors"
              onClick={() => onTagClick(tag.id)}
            >
              {tag.name}
              {activeTags.includes(tag.id) && <X size={14} className="ml-1" />}
            </Badge>
          ))}
        </div>
        {activeTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={onClearTags}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};

export default TagFilter;

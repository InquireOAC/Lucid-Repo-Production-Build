
import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamCard from "@/components/dreams/DreamCard";

interface DreamGridProps {
  dreams: DreamEntry[];
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (username: string | undefined) => void;
  onTagClick: (tagId: string) => void;
}

const DreamGrid = ({
  dreams,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  onTagClick,
}: DreamGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dreams.map((dream) => {
        const normalizedDream = {
          ...dream,
          generatedImage: dream.generatedImage || dream.image_url,
          tags: Array.isArray(dream.tags) ? dream.tags : [],
          profiles: {
            ...dream.profiles,
            avatar_symbol: dream.profiles?.avatar_symbol,
            avatar_color: dream.profiles?.avatar_color,
          },
        };
        // Use username from dream.profiles for navigation
        const username = normalizedDream.profiles?.username;
        return (
          <DreamCard
            key={normalizedDream.id}
            dream={normalizedDream}
            tags={tags}
            dreamTags={normalizedDream.tags}
            onLike={() => onLike(normalizedDream.id)}
            showUser={true}
            onClick={() => onOpenDream(normalizedDream)}
            onUserClick={() => onUserClick(username)}
            onTagClick={onTagClick}
            showSharedBadge={false}
          />
        );
      })}
    </div>
  );
};

export default DreamGrid;

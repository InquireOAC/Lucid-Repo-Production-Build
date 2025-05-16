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
        // Now avatar_symbol/color are always read from .profiles if present
        const normalizedDream = {
          ...dream,
          generatedImage: dream.generatedImage || dream.image_url,
          tags: Array.isArray(dream.tags) ? dream.tags : [],
          profiles: {
            ...dream.profiles,
            // Guarantee these are passed, allow undefined but prefer profile field
            avatar_symbol: (dream.profiles as any)?.avatar_symbol ?? undefined,
            avatar_color: (dream.profiles as any)?.avatar_color ?? undefined,
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

// NOTE: For full support, update your Supabase select queries to return avatar_symbol, avatar_color.

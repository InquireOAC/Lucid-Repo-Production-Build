
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
        // Extract avatar_symbol and avatar_color directly and safely
        const userProfile = dream.profiles || {};
        const avatarSymbol = (userProfile as any).avatar_symbol ?? undefined;
        const avatarColor = (userProfile as any).avatar_color ?? undefined;

        const normalizedDream = {
          ...dream,
          generatedImage: dream.generatedImage || dream.image_url,
          tags: Array.isArray(dream.tags) ? dream.tags : [],
          profiles: {
            ...userProfile,
          },
          avatarSymbol,
          avatarColor,
        };
        
        const username = normalizedDream.profiles?.username;
        return (
          <DreamCard
            key={normalizedDream.id}
            dream={normalizedDream}
            tags={tags}
            onLike={() => onLike(normalizedDream.id)}
            showUser={true}
            onCardClick={() => onOpenDream(normalizedDream)}
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


import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamCard from "@/components/dreams/DreamCard";

interface DreamGridProps {
  dreams: DreamEntry[];
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (userId: string | undefined) => void;
  onTagClick: (tagId: string) => void;
}

const DreamGrid = ({
  dreams,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  onTagClick
}: DreamGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dreams.map((dream) => (
        <DreamCard
          key={dream.id}
          dream={dream}
          tags={tags}
          onLike={() => onLike(dream.id)}
          showUser={true}
          onClick={() => onOpenDream(dream)}
          onUserClick={() => onUserClick(dream.user_id)}
          onTagClick={onTagClick}
          showSharedBadge={false} // Explicitly disable shared badge in Lucid Repo
        />
      ))}
    </div>
  );
};

export default DreamGrid;

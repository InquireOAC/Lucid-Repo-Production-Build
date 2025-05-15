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
      {dreams.map((dream) => {
        // Ensure dream has consistent image field
        const normalizedDream = {
          ...dream,
          generatedImage: dream.generatedImage || dream.image_url
        };
        // Add log for profiles info
        console.log("DreamGrid dream.profiles:", normalizedDream.profiles);
        // Add log for user_id navigation
        const dreamUserId = normalizedDream.userId || normalizedDream.user_id;
        if (dreamUserId == null) {
          console.warn("Dream with missing user id for navigation:", normalizedDream);
        }
        // Use only dream.userId or dream.user_id for navigation
        const profileId = normalizedDream.userId || normalizedDream.user_id;
        if (!profileId) {
          console.warn("Dream with missing profile id for navigation:", normalizedDream);
        }
        return (
          <DreamCard
            key={normalizedDream.id}
            dream={normalizedDream}
            tags={tags}
            onLike={() => onLike(normalizedDream.id)}
            showUser={true}
            onClick={() => onOpenDream(normalizedDream)}
            onUserClick={() => {
              // Pass the profileId (uuid) for navigation
              onUserClick(profileId);
            }}
            onTagClick={onTagClick}
            showSharedBadge={false}
          />
        );
      })}
    </div>
  );
};

export default DreamGrid;

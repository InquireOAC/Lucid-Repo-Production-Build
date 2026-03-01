
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
  currentUser?: any;
}

const DreamGrid = ({
  dreams,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  onTagClick,
  currentUser,
}: DreamGridProps) => {
  const handleCommentClick = (dreamId: string) => {
    // Find the dream and open it directly to comments section
    const dream = dreams.find(d => d.id === dreamId);
    if (dream) {
      onOpenDream(dream);
      // Scroll to comments section after a small delay to ensure modal is open
      setTimeout(() => {
        const commentsSection = document.querySelector('[data-comments-section]');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-1.5">
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
            onComment={handleCommentClick}
            showUser={true}
            onCardClick={() => onOpenDream(normalizedDream)}
            onUserClick={() => onUserClick(username)}
            onTagClick={onTagClick}
            showSharedBadge={false}
            currentUser={currentUser}
          />
        );
      })}
    </div>
  );
};

export default DreamGrid;


import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { Loader2, MessageCircle } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import DreamGrid from "@/components/repos/DreamGrid";

interface LucidDreamsContentProps {
  isLoading: boolean;
  filteredDreams: DreamEntry[];
  dreamTags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (userId: string | undefined) => void;
  onTagClick: (tagId: string) => void;
  searchQuery: string;
}

const LucidDreamsContent = ({
  isLoading,
  filteredDreams,
  dreamTags,
  onLike,
  onOpenDream,
  onUserClick,
  onTagClick,
  searchQuery
}: LucidDreamsContentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
      </div>
    );
  }

  if (filteredDreams.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle className="h-12 w-12 text-muted-foreground" />}
        title="No dreams found"
        description={
          searchQuery
            ? "Try a different search term or filter"
            : "Be the first to share your dream with the community"
        }
      />
    );
  }

  return (
    <DreamGrid
      dreams={filteredDreams}
      tags={dreamTags}
      onLike={onLike}
      onOpenDream={onOpenDream}
      onUserClick={onUserClick}
      onTagClick={onTagClick}
    />
  );
};

export default LucidDreamsContent;

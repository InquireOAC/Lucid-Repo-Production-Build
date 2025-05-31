
import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamGrid from "./DreamGrid";

interface LucidDreamsContentProps {
  isLoading: boolean;
  filteredDreams: DreamEntry[];
  dreamTags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (userId: string | undefined) => void;
  onTagClick: (tagId: string) => void;
  searchQuery: string;
  currentUser?: any;
}

const LucidDreamsContent = ({
  isLoading,
  filteredDreams,
  dreamTags,
  onLike,
  onOpenDream,
  onUserClick,
  onTagClick,
  searchQuery,
  currentUser,
}: LucidDreamsContentProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading dreams...</div>
      </div>
    );
  }

  if (filteredDreams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {searchQuery ? "No dreams match your search" : "No public dreams yet"}
        </p>
      </div>
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
      currentUser={currentUser}
    />
  );
};

export default LucidDreamsContent;

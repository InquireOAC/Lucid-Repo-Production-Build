
import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import LucidDreamsContent from "@/components/repos/LucidDreamsContent";

interface LucidRepoDreamListProps {
  isLoading: boolean;
  filteredDreams: DreamEntry[];
  dreamTags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (userId: string | undefined) => void;
  onTagClick: (tagId: string) => void;
  searchQuery: string;
  currentUser?: any; // Added missing prop
}

const LucidRepoDreamList = ({
  isLoading,
  filteredDreams,
  dreamTags,
  onLike,
  onOpenDream,
  onUserClick,
  onTagClick,
  searchQuery,
  currentUser
}: LucidRepoDreamListProps) => {
  return (
    <LucidDreamsContent
      isLoading={isLoading}
      filteredDreams={filteredDreams}
      dreamTags={dreamTags}
      onLike={onLike}
      onOpenDream={onOpenDream}
      onUserClick={onUserClick}
      onTagClick={onTagClick}
      searchQuery={searchQuery}
      currentUser={currentUser}
    />
  );
};

export default LucidRepoDreamList;

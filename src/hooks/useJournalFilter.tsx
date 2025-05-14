
import { useState } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { useDreamStore } from "@/store/dreamStore";

export const useJournalFilter = (entries: DreamEntry[]) => {
  const { tags } = useDreamStore();
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);

  const handleTagClick = (tagId: string) => {
    setActiveTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Filter dreams by active tags
  const filteredDreams =
    activeTagIds.length > 0
      ? entries.filter((dream) =>
          dream.tags.some((tagId) => activeTagIds.includes(tagId))
        )
      : entries;

  // Get unique tags used in dreams for display in filter bar
  const uniqueTagsInDreams = tags.filter((tag) =>
    entries.some((dream) => dream.tags.includes(tag.id))
  );

  return {
    tags,
    activeTagIds,
    filteredDreams,
    uniqueTagsInDreams,
    handleTagClick,
    setActiveTagIds
  };
};


import { DreamEntry, DreamTag } from "@/types/dream";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface UseLucidRepoFiltersProps {
  dreamsState: DreamEntry[];
  searchQuery: string;
  activeTags: string[];
  publicTags?: DreamTag[];
}

export function useLucidRepoFilters({ dreamsState, searchQuery, activeTags, publicTags = [] }: UseLucidRepoFiltersProps) {
  const { isUserBlocked } = useBlockedUsers();

  // Resolve active tag IDs to tag names for case-insensitive matching
  const activeTagNames = activeTags.map(tagId => {
    const found = publicTags.find(t => t.id === tagId);
    return found ? found.name.toLowerCase() : tagId.toLowerCase();
  });

  const normalizedDreams = dreamsState.filter(dream => !isUserBlocked(dream.user_id))
    .map(dream => ({
      ...dream,
      tags: Array.isArray(dream.tags) ? dream.tags : []
    }));

  const filteredDreams = normalizedDreams.filter(dream => {
    let matchesSearch = true;
    let matchesTags = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = dream.title?.toLowerCase().includes(query) || 
        dream.content?.toLowerCase().includes(query) || 
        dream.profiles?.username?.toLowerCase()?.includes(query) || 
        dream.profiles?.display_name?.toLowerCase()?.includes(query);
    }
    if (activeTagNames.length > 0) {
      matchesTags = dream.tags && dream.tags.some((t: string) => activeTagNames.includes(t.toLowerCase()));
    }
    return matchesSearch && matchesTags;
  });

  return { filteredDreams };
}

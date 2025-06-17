
import { DreamEntry } from "@/types/dream";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface UseLucidRepoFiltersProps {
  dreamsState: DreamEntry[];
  searchQuery: string;
  activeTags: string[];
}

export function useLucidRepoFilters({ dreamsState, searchQuery, activeTags }: UseLucidRepoFiltersProps) {
  const { isUserBlocked } = useBlockedUsers();

  // Filter dreams based on search query and tags and blocked users
  const normalizedDreams = dreamsState.filter(dream => !isUserBlocked(dream.user_id)) // Filter out blocked users
    .map(dream => ({
      ...dream,
      tags: Array.isArray(dream.tags) ? dream.tags : []
    }));

  // Tag filtering: Only show dreams where at least one dream.tags[] (ID string) matches activeTags[]
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
    if (activeTags.length > 0) {
      matchesTags = dream.tags && dream.tags.some((t: string) => activeTags.includes(t));
    }
    return matchesSearch && matchesTags;
  });

  return { filteredDreams };
}

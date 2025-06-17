import { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { useDreams } from "@/hooks/useDreams";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";

export function useLucidRepoDreamState(user: any, refreshLikedDreams: () => void) {
  const {
    dreams: allDreams,
    isLoading: allDreamsLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleUpdateDream,
    fetchPublicDreams
  } = useDreams(refreshLikedDreams);

  // Get dreams from users the current user follows
  const { dreams: followingDreams, isLoading: followingLoading } = useFeedPublicDreams(user);

  // Determine which dreams to show based on active tab
  const dreams = activeTab === "following" ? followingDreams : allDreams;
  const isLoading = activeTab === "following" ? followingLoading : allDreamsLoading;

  // Centralized state for dreams, to ensure `useLikes` can sync state
  const [dreamsState, setDreamsState] = useState<DreamEntry[]>([]);

  // Only update dreamsState when dreams data actually changes (not on every render)
  useEffect(() => {
    if (dreams.length > 0) {
      setDreamsState(prevState => {
        // If we have existing state with local updates, preserve those
        if (prevState.length === dreams.length) {
          return prevState.map(prevDream => {
            const newDream = dreams.find(d => d.id === prevDream.id);
            if (newDream) {
              // Keep the higher like count (in case we've updated them locally)
              return {
                ...newDream,
                like_count: Math.max(prevDream.like_count || 0, newDream.like_count || 0),
                likeCount: Math.max(prevDream.likeCount || 0, newDream.likeCount || 0),
                // Also preserve the liked state if it was updated locally
                liked: prevDream.liked !== undefined ? prevDream.liked : newDream.liked
              };
            }
            return prevDream;
          });
        }
        // If dreams length changed, use new data
        return dreams;
      });
    } else if (dreams.length === 0) {
      setDreamsState([]);
    }
  }, [dreams]);

  return {
    dreamsState,
    setDreamsState,
    isLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleUpdateDream,
    fetchPublicDreams
  };
}

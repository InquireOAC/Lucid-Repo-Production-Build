import React, { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import LucidRepoDreamList from "./LucidRepoDreamList";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";
import { toast } from "sonner";
import { useDreams } from "@/hooks/useDreams";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useLikes } from "@/hooks/useLikes";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

const ALLOWED_TAGS = [
  "Nightmare", "Lucid", "Recurring", "Adventure", "Spiritual", "Flying", "Falling", "Water", "Love"
];

const LucidRepoContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const { isUserBlocked } = useBlockedUsers();

  const {
    dreams,
    isLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleUpdateDream,
    fetchPublicDreams
  } = useDreams(refreshLikedDreams);

  // Centralized state for dreams, to ensure `useLikes` can sync state
  const [dreamsState, setDreamsState] = useState<DreamEntry[]>([]);
  
  // Only update dreamsState when dreams data actually changes (not on every render)
  useEffect(() => { 
    if (dreams.length > 0) {
      setDreamsState(prevState => {
        // If we have existing state with view count updates, preserve those
        if (prevState.length === dreams.length) {
          return prevState.map(prevDream => {
            const newDream = dreams.find(d => d.id === prevDream.id);
            if (newDream) {
              // Keep the higher view count (in case we've updated it locally)
              return {
                ...newDream,
                view_count: Math.max(prevDream.view_count || 0, newDream.view_count || 0)
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

  // For profile liked dreams refresh (noop since this is repo)
  function refreshLikedDreams() {
    fetchPublicDreams();
  }

  // useLikes hook to keep liked state in sync and handle like logic
  const { handleLike } = useLikes(
    user,
    dreamsState,
    setDreamsState,
    refreshLikedDreams
  );

  // Fetch globally visible dream tags for the repo page
  const { tags: publicTags, isLoading: tagsLoading } = usePublicDreamTags();

  // Only allow tags in the allowed list
  const filteredDreamTags = publicTags.filter(tag => ALLOWED_TAGS.includes(tag.name));

  useEffect(() => {
    fetchPublicDreams();
    // Only fetch on initial load - no automatic refresh interval
  }, []); 

  const handleOpenDream = (dream: DreamEntry) => {
    setSelectedDream({ ...dream });
  };

  const handleCloseDream = () => {
    setSelectedDream(null);
    // Don't refresh here - the view count and like updates should already be in dreamsState
  };

  const handleNavigateToProfile = (username: string | undefined) => {
    if (username) navigate(`/profile/${username}`);
  };

  const handleTagClick = (tagId: string) => {
    setActiveTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClearTags = () => setActiveTags([]);

  // Handler for updating view count when opening dream
  const handleViewCountUpdate = (dreamId: string) => {
    setDreamsState(prevDreams =>
      prevDreams.map(dream =>
        dream.id === dreamId
          ? {
              ...dream,
              view_count: (dream.view_count || 0) + 1
            }
          : dream
      )
    );
    
    // Also update the selectedDream if it's the one being updated
    if (selectedDream && selectedDream.id === dreamId) {
      setSelectedDream(prevDream => ({
        ...prevDream!,
        view_count: (prevDream?.view_count || 0) + 1
      }));
    }
  };

  // The MAIN handler: when liking a dream from modal, update state
  const handleDreamLike = async (dreamId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    const success = await handleLike(dreamId);
    if (success) {
      // Find the updated dream with the new like count
      const updatedDream = dreamsState.find(d => d.id === dreamId);
      
      if (updatedDream) {
        // Update the selected dream if it's the one being liked
        if (selectedDream && selectedDream.id === dreamId) {
          setSelectedDream({ ...updatedDream });
        }
      }
    }
  };

  const handleDreamUpdate = (id: string, updates: Partial<DreamEntry>) => {
    const dreamToUpdate = dreamsState.find(d => d.id === id);
    if (!dreamToUpdate) {
      toast.error("Dream not found");
      return;
    }
    if (user && dreamToUpdate.user_id !== user.id) {
      return;
    }
    handleUpdateDream(id, updates).then(success => {
      if (success) {
        fetchPublicDreams();
        if (updates.is_public === false || updates.isPublic === false) {
          toast.success("Dream is now private");
        }
      } else {
        toast.error("Failed to update dream");
      }
    });
  };

  // Filter dreams based on search query and tags and blocked users
  const normalizedDreams = dreamsState
    .filter(dream => !isUserBlocked(dream.user_id)) // Filter out blocked users
    .map(dream => ({
      ...dream,
      tags: Array.isArray(dream.tags) ? dream.tags : []
    }));

  // Tag filtering: Only show dreams where at least one dream.tags[] (ID string) matches activeTags[]
  const filteredDreams = normalizedDreams.filter((dream) => {
    let matchesSearch = true;
    let matchesTags = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        dream.title?.toLowerCase().includes(query) ||
        dream.content?.toLowerCase().includes(query) ||
        dream.profiles?.username?.toLowerCase()?.includes(query) ||
        dream.profiles?.display_name?.toLowerCase()?.includes(query);
    }
    if (activeTags.length > 0) {
      matchesTags = dream.tags && dream.tags.some((t: string) => activeTags.includes(t));
    }
    return matchesSearch && matchesTags;
  });

  // ---- MAIN UI ----
  return (
    <PullToRefresh onRefresh={fetchPublicDreams}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 gradient-text">Lucid Repository</h1>
        <LucidRepoHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sortBy={sortBy}
          setSortBy={setSortBy}
          handleSearch={(e: React.FormEvent) => e.preventDefault()}
          tags={filteredDreamTags}
          activeTags={activeTags}
          onTagClick={handleTagClick}
          onClearTags={handleClearTags}
        />
        <LucidRepoDreamList
          isLoading={isLoading || tagsLoading}
          filteredDreams={filteredDreams}
          dreamTags={filteredDreamTags}
          onLike={() => {}} // Pass empty function since likes should only work from modal
          onOpenDream={handleOpenDream}
          onUserClick={handleNavigateToProfile}
          onTagClick={handleTagClick}
          searchQuery={searchQuery}
          currentUser={user}
        />
        {selectedDream && (
          <DreamDetailWrapper
            selectedDream={dreamsState.find(d => d.id === selectedDream.id) || selectedDream}
            tags={filteredDreamTags}
            onClose={handleCloseDream}
            onUpdate={handleDreamUpdate}
            isAuthenticated={!!user}
            onLike={() => handleDreamLike(selectedDream.id)}
            onViewCountUpdate={handleViewCountUpdate}
          />
        )}
        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
        />
      </div>
    </PullToRefresh>
  );
};

export default LucidRepoContainer;

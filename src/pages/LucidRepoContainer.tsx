
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

  // Centralized setter for dreams, to ensure `useLikes` can sync state
  const [dreamsState, setDreamsState] = useState<DreamEntry[]>([]);
  useEffect(() => { setDreamsState(dreams); }, [dreams]);

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

  // NEW: Fetch globally visible dream tags for the repo page
  const { tags: publicTags, isLoading: tagsLoading } = usePublicDreamTags();

  // Only allow tags in the allowed list
  const filteredDreamTags = publicTags.filter(tag => ALLOWED_TAGS.includes(tag.name));

  useEffect(() => {
    fetchPublicDreams();
    const refreshInterval = setInterval(() => {
      fetchPublicDreams();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  // When backend dreams update, update local dreamsState
  useEffect(() => { setDreamsState(dreams); }, [dreams]);

  const handleOpenDream = (dream: DreamEntry) => {
    setSelectedDream({ ...dream });
  };

  const handleCloseDream = () => {
    setSelectedDream(null);
    // Refresh the dreams list to get updated like/view counts
    fetchPublicDreams();
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

  // The MAIN handler: when liking a dream from modal, update state and refresh
  const handleDreamLike = async (dreamId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    const success = await handleLike(dreamId);
    if (success) {
      // Update the selected dream if it's the one being liked
      if (selectedDream && selectedDream.id === dreamId) {
        const updatedDream = dreamsState.find(d => d.id === dreamId);
        if (updatedDream) {
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

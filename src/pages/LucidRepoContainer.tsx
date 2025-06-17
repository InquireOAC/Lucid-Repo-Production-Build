
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import LucidRepoDreamList from "./LucidRepoDreamList";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import { useLucidRepoDreamState } from "@/hooks/useLucidRepoDreamState";
import { useLucidRepoDreamActions } from "@/hooks/useLucidRepoDreamActions";
import { useLucidRepoFilters } from "@/components/repos/LucidRepoFilters";

const ALLOWED_TAGS = ["Nightmare", "Lucid", "Recurring", "Adventure", "Spiritual", "Flying", "Falling", "Water", "Love"];

const LucidRepoContainer = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // For profile liked dreams refresh (noop since this is repo)
  function refreshLikedDreams() {
    fetchPublicDreams();
  }

  // Custom hooks for state management
  const {
    dreamsState,
    setDreamsState,
    isLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleUpdateDream,
    fetchPublicDreams
  } = useLucidRepoDreamState(user, refreshLikedDreams);

  // Custom hooks for dream actions
  const {
    selectedDream,
    authDialogOpen,
    setAuthDialogOpen,
    handleOpenDream,
    handleCloseDream,
    handleNavigateToProfile,
    handleDreamLike,
    handleDreamLikeFromCard,
    handleDreamUpdate
  } = useLucidRepoDreamActions(
    user,
    dreamsState,
    setDreamsState,
    refreshLikedDreams,
    handleUpdateDream,
    fetchPublicDreams
  );

  // Custom hook for filtering
  const { filteredDreams } = useLucidRepoFilters({
    dreamsState,
    searchQuery,
    activeTags
  });

  // Fetch globally visible dream tags for the repo page
  const { tags: publicTags, isLoading: tagsLoading } = usePublicDreamTags();

  // Only allow tags in the allowed list
  const filteredDreamTags = publicTags.filter(tag => ALLOWED_TAGS.includes(tag.name));

  useEffect(() => {
    // Initialize with "following" tab if user is logged in, otherwise "recent"
    if (user && activeTab === "popular") {
      setActiveTab("following");
    } else if (!user && activeTab === "following") {
      setActiveTab("recent");
    }
    
    if (activeTab === "recent") {
      fetchPublicDreams();
    }
    // Only fetch on initial load - no automatic refresh interval
  }, [user, activeTab]);

  // Refresh data when tab changes (background refresh)
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Refresh in background when switching tabs
    if (newTab === "recent") {
      setTimeout(fetchPublicDreams, 100);
    }
  };

  const handleTagClick = (tagId: string) => {
    setActiveTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const handleClearTags = () => setActiveTags([]);

  // ---- MAIN UI ----
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 gradient-text text-center">Lucid Repo</h1>
      <LucidRepoHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
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
        onLike={handleDreamLikeFromCard} 
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
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default LucidRepoContainer;

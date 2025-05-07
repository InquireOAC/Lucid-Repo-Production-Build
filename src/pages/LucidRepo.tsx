
import React, { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import { useDreams } from "@/hooks/useDreams";
import LucidDreamsContent from "@/components/repos/LucidDreamsContent";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";

const LucidRepo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);

  // Using the refactored hook
  const {
    dreams,
    dreamTags,
    isLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    playingAudioId,
    handleLike,
    handleToggleAudio,
    handleUpdateDream,
    fetchPublicDreams
  } = useDreams();

  // Refresh dreams when component mounts and periodically
  useEffect(() => {
    fetchPublicDreams();
    
    // Refresh dreams every 30 seconds to catch newly shared dreams
    const refreshInterval = setInterval(() => {
      fetchPublicDreams();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter dreams based on search query is done client-side in the filteredDreams variable
  };

  const handleOpenDream = (dream: DreamEntry) => {
    console.log("Opening dream with audio:", dream.audioUrl || dream.audio_url);
    // Stop any playing audio when opening dream detail
    if (playingAudioId) {
      handleToggleAudio(playingAudioId);
    }
    setSelectedDream(dream);
  };

  const handleCloseDream = () => {
    setSelectedDream(null);
  };

  const handleNavigateToProfile = (userId: string | undefined) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleTagClick = (tagId: string) => {
    // Future implementation: filter by tag
    console.log("Tag clicked:", tagId);
  };

  const handleDreamLike = (dreamId: string) => {
    // If user is not authenticated, show auth dialog
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    handleLike(dreamId);
  };
  
  const handleDreamUpdate = (id: string, updates: Partial<DreamEntry>) => {
    const success = handleUpdateDream(id, updates);
    if (success) {
      // After successfully updating dream, refresh all public dreams
      fetchPublicDreams();
    }
  };

  // Filter dreams based on search query
  const filteredDreams = dreams.filter((dream) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        dream.title?.toLowerCase().includes(query) ||
        dream.content?.toLowerCase().includes(query) ||
        dream.profiles?.username?.toLowerCase()?.includes(query) ||
        dream.profiles?.display_name?.toLowerCase()?.includes(query)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 gradient-text">Lucid Repository</h1>

      <LucidRepoHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleSearch={handleSearch}
      />

      <LucidDreamsContent
        isLoading={isLoading}
        filteredDreams={filteredDreams}
        dreamTags={dreamTags}
        onLike={handleDreamLike}
        onOpenDream={handleOpenDream}
        onUserClick={handleNavigateToProfile}
        onTagClick={handleTagClick}
        searchQuery={searchQuery}
      />

      <DreamDetailWrapper
        selectedDream={selectedDream}
        tags={dreamTags}
        onClose={handleCloseDream}
        onUpdate={handleDreamUpdate}
        isAuthenticated={!!user}
      />

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
    </div>
  );
};

export default LucidRepo;

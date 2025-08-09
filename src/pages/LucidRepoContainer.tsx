
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import LucidRepoDreamList from "./LucidRepoDreamList";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";
import VideoGrid from "@/components/videos/VideoGrid";
import VideoDetail from "@/components/videos/VideoDetail";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import { useLucidRepoDreamState } from "@/hooks/useLucidRepoDreamState";
import { useLucidRepoDreamActions } from "@/hooks/useLucidRepoDreamActions";
import { useLucidRepoFilters } from "@/components/repos/LucidRepoFilters";
import { VideoEntry } from "@/types/video";

const ALLOWED_TAGS = ["Nightmare", "Lucid", "Recurring", "Adventure", "Spiritual", "Flying", "Falling", "Water", "Love"];

const LucidRepoContainer = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [mode, setMode] = useState<"dreams" | "videos">("dreams");
  const [selectedVideo, setSelectedVideo] = useState<VideoEntry | null>(null);

  // Mock video data - replace with real data from your backend
  const [videos] = useState<VideoEntry[]>([
    {
      id: "1",
      title: "Journey Through the Astral Plane",
      description: "A mesmerizing exploration of consciousness and the dream realm, following a lucid dreamer as they navigate through different dimensions of awareness.",
      video_url: "/videos/sample1.mp4",
      thumbnail_url: "/thumbnails/astral.jpg",
      dreamer_story_name: "The Astral Explorer",
      duration: 720,
      created_at: "2024-01-15T10:00:00Z",
      view_count: 1250,
      like_count: 89
    },
    {
      id: "2", 
      title: "The Nightmare Alchemist",
      description: "Transform your deepest fears into sources of strength. This film follows the journey of turning nightmares into lucid dreams through ancient techniques.",
      video_url: "/videos/sample2.mp4",
      thumbnail_url: "/thumbnails/nightmare.jpg",
      dreamer_story_name: "Shadow Work Chronicles",
      duration: 480,
      created_at: "2024-01-10T14:30:00Z",
      view_count: 892,
      like_count: 156
    },
    {
      id: "3",
      title: "Flying Dreams: Mastery of the Skies",
      description: "Learn the secrets of dream flight in this comprehensive guide to one of lucid dreaming's most beloved experiences.",
      video_url: "/videos/sample3.mp4", 
      thumbnail_url: "/thumbnails/flying.jpg",
      dreamer_story_name: "Wings of Consciousness",
      duration: 600,
      created_at: "2024-01-05T09:15:00Z",
      view_count: 2103,
      like_count: 234
    }
  ]);

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
    // Only run initialization logic once
    if (!hasInitialized) {
      // Initialize with "following" tab if user is logged in, otherwise "recent"
      if (user && activeTab === "recent") {
        setActiveTab("following");
      }
      setHasInitialized(true);
    }
    
    // Fetch data for any tab that needs public dreams
    if (activeTab === "recent" || activeTab === "popular") {
      fetchPublicDreams();
    }
  }, [user, activeTab, hasInitialized]);

  // Refresh data when tab changes (background refresh)
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Refresh in background when switching tabs
    if (newTab === "recent" || newTab === "popular") {
      setTimeout(fetchPublicDreams, 100);
    }
  };

  const handleTagClick = (tagId: string) => {
    setActiveTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const handleClearTags = () => setActiveTags([]);

  const handleOpenVideo = (video: VideoEntry) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.dreamer_story_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---- MAIN UI ----
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
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
        mode={mode}
        setMode={setMode}
      />
      
      {mode === "dreams" ? (
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
      ) : (
        <VideoGrid 
          videos={filteredVideos}
          onOpenVideo={handleOpenVideo}
        />
      )}

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

      {selectedVideo && (
        <VideoDetail
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={handleCloseVideo}
        />
      )}

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default LucidRepoContainer;

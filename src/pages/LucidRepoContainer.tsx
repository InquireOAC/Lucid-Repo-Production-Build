import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import LucidRepoDreamList from "./LucidRepoDreamList";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";
import VideoGrid from "@/components/videos/VideoGrid";
import VideoDetail from "@/components/videos/VideoDetail";
import FeaturedDream from "@/components/repos/FeaturedDream";
import MasonryDreamGrid from "@/components/repos/MasonryDreamGrid";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import { useLucidRepoDreamState } from "@/hooks/useLucidRepoDreamState";
import { useLucidRepoDreamActions } from "@/hooks/useLucidRepoDreamActions";
import { useLucidRepoFilters } from "@/components/repos/LucidRepoFilters";
import { useVideoEntries } from "@/hooks/useVideoEntries";
import { VideoEntry } from "@/types/video";
import { Moon } from "lucide-react";

const ALLOWED_TAGS = ["Nightmare", "Lucid", "Recurring", "Adventure", "Spiritual", "Flying", "Falling", "Water", "Love"];

const LucidRepoContainer = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [mode, setMode] = useState<"dreams" | "videos">("dreams");
  const [selectedVideo, setSelectedVideo] = useState<VideoEntry | null>(null);

  const { videos: videoEntries, isLoading: videosLoading } = useVideoEntries();

  function refreshLikedDreams() {
    fetchPublicDreams();
  }

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

  const { filteredDreams } = useLucidRepoFilters({
    dreamsState,
    searchQuery,
    activeTags
  });

  const { tags: publicTags, isLoading: tagsLoading } = usePublicDreamTags();
  const filteredDreamTags = publicTags.filter(tag => ALLOWED_TAGS.includes(tag.name));

  useEffect(() => {
    if (!hasInitialized) {
      if (user && activeTab === "recent") {
        setActiveTab("following");
      }
      setHasInitialized(true);
    }
    
    if (activeTab === "recent" || activeTab === "popular") {
      fetchPublicDreams();
    }
  }, [user, activeTab, hasInitialized]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
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

  const filteredVideos = videoEntries.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.dreamer_story_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get featured dream (most popular with image)
  const featuredDream = filteredDreams.find(d => 
    (d.generatedImage || d.image_url) && (d.like_count || 0) > 0
  ) || filteredDreams.find(d => d.generatedImage || d.image_url);
  
  // Rest of dreams for masonry grid
  const gridDreams = featuredDream 
    ? filteredDreams.filter(d => d.id !== featuredDream.id)
    : filteredDreams;

  return (
    <div className="container mx-auto pt-safe-top px-4 sm:px-6 pb-6 max-w-6xl pl-safe-left pr-safe-right">
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
        <>
          {isLoading || tagsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Moon className="h-10 w-10 text-aurora-purple animate-float" />
              <p className="mt-4 text-muted-foreground">Loading dreams...</p>
            </div>
          ) : filteredDreams.length === 0 ? (
            <div className="text-center py-20">
              <Moon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No dreams found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Be the first to share a dream!"}
              </p>
            </div>
          ) : (
            <>
              {/* Featured Dream */}
              {featuredDream && (
                <FeaturedDream
                  dream={featuredDream}
                  tags={filteredDreamTags}
                  onLike={handleDreamLikeFromCard}
                  onOpenDream={handleOpenDream}
                  onUserClick={handleNavigateToProfile}
                  currentUser={user}
                />
              )}
              
              {/* Masonry Grid */}
              <MasonryDreamGrid
                dreams={gridDreams}
                tags={filteredDreamTags}
                onLike={handleDreamLikeFromCard}
                onOpenDream={handleOpenDream}
                onUserClick={handleNavigateToProfile}
                onTagClick={handleTagClick}
                currentUser={user}
              />
            </>
          )}
        </>
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

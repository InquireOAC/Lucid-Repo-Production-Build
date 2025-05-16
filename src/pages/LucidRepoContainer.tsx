
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

const ALLOWED_TAGS = [
  "Nightmare",
  "Lucid",
  "Recurring",
  "Adventure",
  "Spiritual",
  "Flying",
  "Falling",
  "Water",
  "love"
];

const LucidRepoContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const {
    dreams,
    dreamTags,
    isLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleLike,
    handleUpdateDream,
    fetchPublicDreams
  } = useDreams();

  // Ensure ALL dreams have .tags property (default to []) so filtering and tags show.
  const normalizedDreams = dreams.map(dream => ({
    ...dream,
    tags: Array.isArray(dream.tags) ? dream.tags : []
  }));

  // Filter the dreamTags for only allowed tags
  const filteredDreamTags = dreamTags.filter(tag =>
    ALLOWED_TAGS.includes(tag.name)
  );

  useEffect(() => {
    fetchPublicDreams();
    const refreshInterval = setInterval(() => {
      fetchPublicDreams();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleOpenDream = (dream: DreamEntry) => {
    setSelectedDream(dream);
  };

  const handleCloseDream = () => {
    setSelectedDream(null);
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

  const handleDreamLike = (dreamId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    handleLike(dreamId);
  };

  const handleDreamUpdate = (id: string, updates: Partial<DreamEntry>) => {
    const dreamToUpdate = dreams.find(d => d.id === id);
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

  // Filter dreams based on search query and tags using normalizedDreams now
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
        handleSearch={(e: React.FormEvent) => e.preventDefault()}
        tags={filteredDreamTags}
        activeTags={activeTags}
        onTagClick={handleTagClick}
        onClearTags={handleClearTags}
      />
      <LucidRepoDreamList
        isLoading={isLoading}
        filteredDreams={filteredDreams}
        dreamTags={filteredDreamTags}
        onLike={handleDreamLike}
        onOpenDream={handleOpenDream}
        onUserClick={handleNavigateToProfile}
        onTagClick={handleTagClick}
        searchQuery={searchQuery}
      />
      <DreamDetailWrapper
        selectedDream={selectedDream}
        tags={filteredDreamTags}
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

export default LucidRepoContainer;

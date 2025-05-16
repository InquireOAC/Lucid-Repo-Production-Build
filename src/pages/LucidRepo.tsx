import React, { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import { useDreams } from "@/hooks/useDreams";
import LucidDreamsContent from "@/components/repos/LucidDreamsContent";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";
import { toast } from "sonner";
import TagFilter from "@/components/journal/TagFilter";

const LucidRepo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Using the refactored hook
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

  // Add log when dreams are updated
  useEffect(() => {
    if (dreams && dreams.length > 0) {
      console.log("LucidRepo: Dreams loaded");
      dreams.forEach((d, i) => {
        console.log(`Dream[${i}]: user_id=${d.user_id}, userId=${d.userId}, profiles=`, d.profiles);
      });
    }
  }, [dreams]);

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
    setSelectedDream(dream);
  };

  const handleCloseDream = () => {
    setSelectedDream(null);
    // Refresh dreams list when closing dream detail to ensure we have the latest data
    fetchPublicDreams();
  };

  // Enhanced: Log navigation, warn if username is missing
  const handleNavigateToProfile = (username: string | undefined) => {
    console.log("Profile navigation requested for username:", username);
    if (username) {
      // Navigate with /profile/:username
      navigate(`/profile/${username}`);
    } else {
      console.warn("No username provided for navigation.");
    }
  };

  const handleTagClick = (tagId: string) => {
    // Toggle tag in activeTags array
    setActiveTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClearTags = () => setActiveTags([]);

  const handleDreamLike = (dreamId: string) => {
    // If user is not authenticated, show auth dialog
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    handleLike(dreamId);
  };
  
  const handleDreamUpdate = (id: string, updates: Partial<DreamEntry>) => {
    // Locate the dream and check ownership first
    const dreamToUpdate = dreams.find(d => d.id === id);
    if (!dreamToUpdate) {
      toast.error("Dream not found");
      return;
    }
    // Remove: toast for forbidden update on non-owned dreams
    if (user && dreamToUpdate.user_id !== user.id) {
      return; // silently block
    }
    handleUpdateDream(id, updates)
      .then(success => {
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

  // Filter dreams based on search query and tags
  const filteredDreams = dreams.filter((dream) => {
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
        handleSearch={handleSearch}
        tags={dreamTags}
        activeTags={activeTags}
        onTagClick={handleTagClick}
        onClearTags={handleClearTags}
      />
      {/* Removed duplicate TagFilter UI for tag selection */}
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

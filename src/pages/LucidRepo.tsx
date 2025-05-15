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

  // Enhanced: Log navigation, warn if userId is missing
  const handleNavigateToProfile = (userId: string | undefined) => {
    console.log("Profile navigation requested for userId:", userId);
    if (userId) {
      // Navigate with /profile/:userId (uuid)
      navigate(`/profile/${userId}`);
    } else {
      console.warn("No userId provided for navigation.");
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
    handleUpdateDream(id, updates)
      .then(success => {
        if (success) {
          // After successfully updating dream, refresh all public dreams
          fetchPublicDreams();
          
          // Show appropriate toast message
          if (updates.is_public === false || updates.isPublic === false) {
            toast.success("Dream is now private");
          }
        }
      });
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
        // Pass DREAM.user_id, not username!
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

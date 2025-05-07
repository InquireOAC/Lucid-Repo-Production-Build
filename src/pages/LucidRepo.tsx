
import React, { useState, useEffect } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import DreamDetail from "@/components/DreamDetail";
import EmptyState from "@/components/ui/empty-state";
import { useNavigate } from "react-router-dom";
import LucidRepoHeader from "@/components/repos/LucidRepoHeader";
import DreamGrid from "@/components/repos/DreamGrid";

const LucidRepo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [dreamTags, setDreamTags] = useState<DreamTag[]>([]);

  useEffect(() => {
    fetchPublicDreams();
    fetchDreamTags();
  }, [sortBy, activeTab]);

  useEffect(() => {
    if (user) {
      checkLikedDreams();
    }
  }, [user, dreams]);

  const fetchDreamTags = async () => {
    try {
      const { data, error } = await supabase
        .from("dream_tags")
        .select("*");
      
      if (error) throw error;
      setDreamTags(data || []);
    } catch (error) {
      console.error("Error fetching dream tags:", error);
    }
  };

  const fetchPublicDreams = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("dream_entries")
        .select("*, profiles:user_id(username, display_name, avatar_url)")
        .eq("is_public", true);

      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else if (sortBy === "most_liked") {
        query = query.order("like_count", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match our DreamEntry type
      const transformedDreams = data.map((dream: any) => ({
        ...dream,
        isPublic: dream.is_public,
        likeCount: dream.like_count || 0,
        commentCount: dream.comment_count || 0,
        userId: dream.user_id,
        audioUrl: dream.audio_url, // Ensure audio_url is mapped to audioUrl
        profiles: dream.profiles
      }));

      console.log("Fetched dreams with audio:", transformedDreams);
      setDreams(transformedDreams);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle like functionality
  const handleLike = async (dreamId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    try {
      // Check if the user has already liked this dream
      const { data: existingLike } = await supabase
        .from("dream_likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("dream_id", dreamId)
        .single();

      if (existingLike) {
        // User already liked this dream, so remove the like
        await supabase
          .from("dream_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("dream_id", dreamId);

        // Update dream like count using SQL update
        await supabase
          .from("dream_entries")
          .update({ like_count: Math.max(0, (dreams.find(d => d.id === dreamId)?.likeCount as number) - 1) })
          .eq("id", dreamId);

        setDreams((prevDreams) =>
          prevDreams.map((dream) =>
            dream.id === dreamId
              ? { ...dream, likeCount: Math.max(0, dream.likeCount as number - 1), liked: false }
              : dream
          )
        );
      } else {
        // User hasn't liked this dream yet, so add a like
        await supabase
          .from("dream_likes")
          .insert({ user_id: user.id, dream_id: dreamId });

        // Update dream like count using SQL update
        await supabase
          .from("dream_entries")
          .update({ like_count: (dreams.find(d => d.id === dreamId)?.likeCount as number) + 1 })
          .eq("id", dreamId);

        setDreams((prevDreams) =>
          prevDreams.map((dream) =>
            dream.id === dreamId
              ? { ...dream, likeCount: (dream.likeCount as number) + 1, liked: true }
              : dream
          )
        );
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const checkLikedDreams = async () => {
    if (!user || dreams.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("dream_likes")
        .select("dream_id")
        .eq("user_id", user.id)
        .in(
          "dream_id",
          dreams.map((dream) => dream.id)
        );

      if (error) throw error;

      const likedDreamIds = new Set(data.map((like) => like.dream_id));

      setDreams((prevDreams) =>
        prevDreams.map((dream) => ({
          ...dream,
          liked: likedDreamIds.has(dream.id),
        }))
      );
    } catch (error) {
      console.error("Error checking liked dreams:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter dreams based on search query is done client-side in the filteredDreams variable
  };

  const handleOpenDream = (dream: DreamEntry) => {
    console.log("Opening dream with audio:", dream.audioUrl || dream.audio_url);
    setSelectedDream(dream);
  };

  const handleUpdateDream = (id: string, updates: Partial<DreamEntry>) => {
    setDreams(prevDreams => 
      prevDreams.map(dream => 
        dream.id === id ? { ...dream, ...updates } : dream
      )
    );
    setSelectedDream(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
        </div>
      ) : filteredDreams.length > 0 ? (
        <DreamGrid
          dreams={filteredDreams}
          tags={dreamTags}
          onLike={handleLike}
          onOpenDream={handleOpenDream}
          onUserClick={handleNavigateToProfile}
          onTagClick={handleTagClick}
        />
      ) : (
        <EmptyState
          icon={<MessageCircle className="h-12 w-12 text-muted-foreground" />}
          title="No dreams found"
          description={
            searchQuery
              ? "Try a different search term or filter"
              : "Be the first to share your dream with the community"
          }
        />
      )}

      {selectedDream && (
        <DreamDetail
          dream={selectedDream}
          tags={dreamTags}
          onClose={handleCloseDream}
          onUpdate={handleUpdateDream}
          onDelete={() => {
            // We don't allow deletion from LucidRepo yet
            handleCloseDream();
          }}
          isAuthenticated={!!user}
        />
      )}

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to sign in to like dreams and interact with the community.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LucidRepo;

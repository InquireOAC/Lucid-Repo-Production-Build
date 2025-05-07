
import React, { useState, useEffect } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, MessageCircle, Search, Filter, Loader2 } from "lucide-react";
import DreamCard from "@/components/dreams/DreamCard";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import DreamDetail from "@/components/DreamDetail";
import { useNavigate } from "react-router-dom";

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
        profiles: dream.profiles
      }));

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

  const handleNavigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
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

      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search dreams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="flex justify-between items-center">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Dreams</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex justify-end">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most_liked">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
        </div>
      ) : filteredDreams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDreams.map((dream) => (
            <DreamCard
              key={dream.id}
              dream={dream}
              tags={dreamTags}
              onLike={() => handleLike(dream.id)}
              showUser={true}
              onClick={() => handleOpenDream(dream)}
              onUserClick={() => dream.user_id && handleNavigateToProfile(dream.user_id)}
              onTagClick={(tagId) => {
                // Future implementation: filter by tag
                console.log("Tag clicked:", tagId);
              }}
            />
          ))}
        </div>
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

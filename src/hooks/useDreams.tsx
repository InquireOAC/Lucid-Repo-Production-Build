
import { useState, useEffect } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useDreams() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [dreamTags, setDreamTags] = useState<DreamTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

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

      console.log("Fetched dreams with audio:", transformedDreams.map(d => ({ 
        id: d.id, 
        title: d.title,
        audioUrl: d.audioUrl, 
        audio_url: d.audio_url 
      })));
      
      setDreams(transformedDreams);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
      toast.error("Failed to fetch dreams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (dreamId: string) => {
    if (!user) {
      return false;
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
      return true;
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
      return false;
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

  const handleToggleAudio = (dreamId: string) => {
    console.log("Toggling audio for dream:", dreamId);
    // Stop any currently playing audio before starting a new one
    setPlayingAudioId(prev => {
      if (prev && prev !== dreamId) {
        // Log stopping previous audio
        console.log("Stopping audio for dream:", prev);
      }
      return prev === dreamId ? null : dreamId;
    });
  };

  const handleUpdateDream = (id: string, updates: Partial<DreamEntry>) => {
    setDreams(prevDreams => 
      prevDreams.map(dream => 
        dream.id === id ? { ...dream, ...updates } : dream
      )
    );
  };

  return {
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
  };
}

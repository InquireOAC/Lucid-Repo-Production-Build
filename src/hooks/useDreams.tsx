
import { useState, useEffect } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSortAndFilter } from "./useSortAndFilter";
import { useAudioPlayer } from "./useAudioPlayer";
import { useLikes } from "./useLikes";

export function useDreams() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [dreamTags, setDreamTags] = useState<DreamTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { sortBy, setSortBy, activeTab, setActiveTab } = useSortAndFilter();
  const { playingAudioId, handleToggleAudio } = useAudioPlayer();
  const { handleLike } = useLikes(user, dreams);

  useEffect(() => {
    fetchPublicDreams();
    fetchDreamTags();
  }, [sortBy, activeTab]);

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
      console.log("Fetching public dreams with sort:", sortBy);
      
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

      console.log("Fetched public dreams:", data.length);

      // Transform data to match our DreamEntry type
      const transformedDreams = data.map((dream: any) => ({
        ...dream,
        isPublic: dream.is_public,
        likeCount: dream.like_count || 0,
        commentCount: dream.comment_count || 0,
        userId: dream.user_id,
        audioUrl: dream.audio_url, 
        profiles: dream.profiles
      }));
      
      setDreams(transformedDreams);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
      toast.error("Failed to fetch dreams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDream = (id: string, updates: Partial<DreamEntry>) => {
    setDreams(prevDreams => 
      prevDreams.map(dream => 
        dream.id === id ? { ...dream, ...updates } : dream
      )
    );
    
    // Refresh the dreams list after updating a dream
    fetchPublicDreams();
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
    fetchPublicDreams, // Export the refresh function
  };
}

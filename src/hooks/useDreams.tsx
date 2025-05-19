import { useState, useEffect } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSortAndFilter } from "./useSortAndFilter";
import { useLikes } from "./useLikes";

export function useDreams(refreshLikedDreams?: () => void) {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [dreamTags, setDreamTags] = useState<DreamTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { sortBy, setSortBy, activeTab, setActiveTab } = useSortAndFilter();
  // Pass refreshLikedDreams into useLikes
  const { handleLike } = useLikes(user, dreams, setDreams, refreshLikedDreams);

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
        .select(
          "*, profiles:user_id(username, display_name, avatar_url, avatar_symbol, avatar_color)"
        )
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
        profiles: dream.profiles,
        // pass down avatar
        avatarSymbol: dream.profiles?.avatar_symbol || null,
        avatarColor: dream.profiles?.avatar_color || null,
        // Ensure image URLs are properly normalized
        generatedImage: dream.generatedImage || dream.image_url || null,
        image_url: dream.image_url || dream.generatedImage || null,
      }));
      
      setDreams(transformedDreams);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
      toast.error("Failed to fetch dreams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDream = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      // Only attempt to update if the user is the owner of the dream
      const dreamToUpdate = dreams.find(d => d.id === id);
      if (!dreamToUpdate || (user && dreamToUpdate.user_id !== user.id)) {
        console.error("Cannot update dream: not the owner");
        return false;
      }

      // Convert client-side properties to database format
      const dbUpdates: Record<string, any> = {};
      
      if ('isPublic' in updates) {
        dbUpdates.is_public = updates.isPublic;
      }
      if ('is_public' in updates) {
        dbUpdates.is_public = updates.is_public;
      }

      // Filter out fields that don't exist in the DB schema
      Object.entries(updates).forEach(([key, value]) => {
        if (!['commentCount', 'likeCount'].includes(key)) {
          dbUpdates[key] = value;
        }
      });

      // Update the dream in Supabase
      const { error } = await supabase
        .from("dream_entries")
        .update(dbUpdates)
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update the local dream array
      setDreams(prevDreams => 
        prevDreams.map(dream => 
          dream.id === id ? { ...dream, ...updates } : dream
        )
      );
      
      // If the dream is now private, remove it from the list
      if (updates.is_public === false || updates.isPublic === false) {
        setDreams(prevDreams => prevDreams.filter(dream => dream.id !== id));
      }
      
      return true; // Indicate success
    } catch (error) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream");
      return false;
    }
  };

  return {
    dreams,
    dreamTags,
    isLoading,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    handleLike,
    handleUpdateDream,
    fetchPublicDreams, // Export the refresh function
  };
}

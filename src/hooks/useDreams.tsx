
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
        const { data: dreamsRaw, error } = await supabase
          .from("dream_entries")
          .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(50);

      if (error) {
        throw error;
      }

      // For each dream, get the actual like count and comment count from the database
      const dreamsWithCounts = await Promise.all(
        (dreamsRaw || []).map(async (dream: any) => {
          // Get actual like count
          const { count: likeCount } = await supabase
            .from("dream_likes")
            .select("id", { count: "exact", head: true })
            .eq("dream_id", dream.id);

          // Get actual comment count
          const { count: commentCount } = await supabase
            .from("dream_comments")
            .select("id", { count: "exact", head: true })
            .eq("dream_id", dream.id);

          // Check if current user has liked this dream
          let userLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from("dream_likes")
              .select("id")
              .eq("dream_id", dream.id)
              .eq("user_id", user.id)
              .maybeSingle();
            userLiked = !!likeData;
          }

            return {
              ...dream,
              isPublic: dream.is_public,
              likeCount: likeCount || 0,
              like_count: likeCount || 0,
              commentCount: commentCount || 0,
              comment_count: commentCount || 0,
              liked: userLiked,
              userId: dream.user_id,
              profiles: dream.profiles,
              // pass down avatar
              avatarSymbol: dream.profiles?.avatar_symbol || null,
              avatarColor: dream.profiles?.avatar_color || null,
              // Ensure image URLs are properly normalized
              generatedImage: dream.generatedImage || dream.image_url || null,
              image_url: dream.image_url || dream.generatedImage || null,
              // Ensure audio URL is available
              audio_url: dream.audio_url || null,
              audioUrl: dream.audio_url || null,
              video_url: dream.video_url || null,
            };
          })
        );
      
      // If popular tab, sort by engagement after getting actual counts
      if (activeTab === "popular") {
        dreamsWithCounts.sort((a, b) => {
          const aEngagement = (a.like_count || 0) + (a.comment_count || 0);
          const bEngagement = (b.like_count || 0) + (b.comment_count || 0);
          return bEngagement - aEngagement;
        });
      }
      
      setDreams(dreamsWithCounts);
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
        // Do NOT show a toast in this case; just return false
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

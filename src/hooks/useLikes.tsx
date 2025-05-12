
import { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLikes(user: any, dreams: DreamEntry[]) {
  useEffect(() => {
    if (user && dreams.length > 0) {
      checkLikedDreams();
    }
  }, [user, dreams]);

  const handleLike = async (dreamId: string) => {
    if (!user) {
      toast.error("Please sign in to like dreams");
      return false;
    }

    try {
      // Optimistically update UI first for immediate feedback
      const dreamIndex = dreams.findIndex(d => d.id === dreamId);
      if (dreamIndex === -1) return false;

      const dreamToUpdate = dreams[dreamIndex];
      const wasLiked = !!dreamToUpdate.liked;
      const newLikeCount = wasLiked 
        ? Math.max(0, (dreamToUpdate.like_count ?? dreamToUpdate.likeCount ?? 0) - 1)
        : (dreamToUpdate.like_count ?? dreamToUpdate.likeCount ?? 0) + 1;

      // Update local state optimistically
      setDreams(prevDreams => 
        prevDreams.map(dream => 
          dream.id === dreamId
            ? { 
                ...dream, 
                like_count: newLikeCount, 
                likeCount: newLikeCount,
                liked: !wasLiked
              }
            : dream
        )
      );

      // Now perform the actual database operation
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
          .update({ like_count: newLikeCount })
          .eq("id", dreamId);
      } else {
        // User hasn't liked this dream yet, so add a like
        await supabase
          .from("dream_likes")
          .insert({ user_id: user.id, dream_id: dreamId });

        // Update dream like count using SQL update
        await supabase
          .from("dream_entries")
          .update({ like_count: newLikeCount })
          .eq("id", dreamId);
      }

      return true;
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
      
      // Revert the optimistic update on error
      checkLikedDreams();
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

      setDreams(prevDreams => 
        prevDreams.map(dream => ({
          ...dream,
          liked: likedDreamIds.has(dream.id)
        }))
      );
    } catch (error) {
      console.error("Error checking liked dreams:", error);
    }
  };

  // Add a function to update the dreams state
  const setDreams = (updater: (dreams: DreamEntry[]) => DreamEntry[]) => {
    const updatedDreams = updater([...dreams]);
    
    // Replace the dreams in the array with the updated versions
    dreams.splice(0, dreams.length, ...updatedDreams);
  };

  return { handleLike };
}

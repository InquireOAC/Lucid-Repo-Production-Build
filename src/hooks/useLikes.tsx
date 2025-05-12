
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

      const dreamToUpdate = dreams.find(d => d.id === dreamId);
      if (!dreamToUpdate) return false;

      const currentLikeCount = dreamToUpdate.like_count ?? dreamToUpdate.likeCount ?? 0;
      let newLikeCount: number;
      let liked: boolean;

      if (existingLike) {
        // User already liked this dream, so remove the like
        await supabase
          .from("dream_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("dream_id", dreamId);

        // Update dream like count using SQL update
        newLikeCount = Math.max(0, currentLikeCount - 1);
        liked = false;

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
        newLikeCount = currentLikeCount + 1;
        liked = true;

        await supabase
          .from("dream_entries")
          .update({ like_count: newLikeCount })
          .eq("id", dreamId);
      }

      // Update the local state
      setDreams(prevDreams => 
        prevDreams.map(dream => 
          dream.id === dreamId
            ? { 
                ...dream, 
                like_count: newLikeCount, 
                likeCount: newLikeCount,
                liked: liked
              }
            : dream
        )
      );

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

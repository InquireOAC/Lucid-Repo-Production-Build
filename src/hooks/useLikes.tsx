
import { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Update: Fix public dream like/unlike to always allow like_count update
export function useLikes(user: any, dreams: DreamEntry[], setDreams?: (updater: (dreams: DreamEntry[]) => DreamEntry[]) => void, refreshLikedDreams?: () => void) {
  useEffect(() => {
    if (user && dreams.length > 0) {
      checkLikedDreams();
    }
    // eslint-disable-next-line
  }, [user, dreams]);

  const handleLike = async (dreamId: string) => {
    if (!user) {
      toast.error("Please sign in to like dreams");
      return false;
    }

    try {
      const dreamIndex = dreams.findIndex(d => d.id === dreamId);
      if (dreamIndex === -1) return false;

      const dreamToUpdate = dreams[dreamIndex];
      const wasLiked = !!dreamToUpdate.liked;
      const newLikeCount = wasLiked 
        ? Math.max(0, (dreamToUpdate.like_count ?? dreamToUpdate.likeCount ?? 0) - 1)
        : (dreamToUpdate.like_count ?? dreamToUpdate.likeCount ?? 0) + 1;

      // Optimistically update UI
      if (setDreams) {
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
      }

      // Check for existing like
      const { data: existingLike } = await supabase
        .from("dream_likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("dream_id", dreamId)
        .maybeSingle();

      if (existingLike) {
        // Unliking dream
        await supabase
          .from("dream_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("dream_id", dreamId);

        await supabase
          .from("dream_entries")
          .update({ like_count: newLikeCount })
          .eq("id", dreamId);

        toast.success("Removed like");
      } else {
        // Liking the dream
        await supabase
          .from("dream_likes")
          .insert({ user_id: user.id, dream_id: dreamId });

        await supabase
          .from("dream_entries")
          .update({ like_count: newLikeCount })
          .eq("id", dreamId);

        toast.success("Liked dream!");
      }

      // Refresh liked dreams section
      if (refreshLikedDreams) refreshLikedDreams();

      return true;
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
      if (setDreams) checkLikedDreams();
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

      setDreamsFn(prevDreams => 
        prevDreams.map(dream => ({
          ...dream,
          liked: likedDreamIds.has(dream.id)
        }))
      );
    } catch (error) {
      console.error("Error checking liked dreams:", error);
    }
  };

  // Use passed in setDreams if provided, else fallback to in-place hack (for non-reactive)
  const setDreamsFn = setDreams ??
    ((updater: (dreams: DreamEntry[]) => DreamEntry[]) => {
      const updatedDreams = updater([...dreams]);
      dreams.splice(0, dreams.length, ...updatedDreams);
    });

  return { handleLike };
}

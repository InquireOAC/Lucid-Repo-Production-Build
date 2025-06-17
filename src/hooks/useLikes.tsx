
import { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Completely rewritten for reliable like/unlike sync with backend and UI update
export function useLikes(
  user: any,
  dreams: DreamEntry[],
  setDreams?: (updater: (dreams: DreamEntry[]) => DreamEntry[]) => void,
  refreshLikedDreams?: () => void // Make sure to pass this from the repo/profile
) {
  // Helper to keep local liked state synced to DB state
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
      setDreamsFn((prevDreams) =>
        prevDreams.map((dream) => ({
          ...dream,
          liked: likedDreamIds.has(dream.id),
        }))
      );
    } catch (error) {
      console.error("Error checking liked dreams:", error);
    }
  };

  // Use passed in setDreams if provided, else fallback for non-reactive cases
  const setDreamsFn =
    setDreams ??
    ((updater: (dreams: DreamEntry[]) => DreamEntry[]) => {
      const updatedDreams = updater([...dreams]);
      dreams.splice(0, dreams.length, ...updatedDreams);
    });

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

      if (wasLiked) {
        await supabase
          .from("dream_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("dream_id", dreamId);
        toast.success("Removed like");
      } else {
        await supabase
          .from("dream_likes")
          .insert({ user_id: user.id, dream_id: dreamId });
        toast.success("Liked dream!");
      }

      // Refetch actual like count from backend
      const { count } = await supabase
        .from("dream_likes")
        .select("id", { count: "exact", head: true })
        .eq("dream_id", dreamId);
      const newLikeCount = count || 0;

      // Update like_count field in dream_entries table
      await supabase
        .from("dream_entries")
        .update({ like_count: newLikeCount })
        .eq("id", dreamId);

      // Optimistically update UI (local state)
      if (setDreamsFn) {
        setDreamsFn(prevDreams =>
          prevDreams.map(dream =>
            dream.id === dreamId
              ? {
                  ...dream,
                  like_count: newLikeCount,
                  likeCount: newLikeCount,
                  liked: !wasLiked,
                }
              : dream
          )
        );
      }

      // Refresh liked dreams section in your profile (fix: this must run even on unlike)
      if (refreshLikedDreams) refreshLikedDreams();

      return true;
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to update like");
      if (setDreamsFn) checkLikedDreams();
      return false;
    }
  };

  return { handleLike };
}

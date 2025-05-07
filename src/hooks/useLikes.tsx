
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

        dreams.forEach(dream => {
          if (dream.id === dreamId) {
            dream.likeCount = Math.max(0, dream.likeCount as number - 1);
            dream.liked = false;
          }
        });
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

        dreams.forEach(dream => {
          if (dream.id === dreamId) {
            dream.likeCount = (dream.likeCount as number) + 1;
            dream.liked = true;
          }
        });
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

      dreams.forEach(dream => {
        dream.liked = likedDreamIds.has(dream.id);
      });
    } catch (error) {
      console.error("Error checking liked dreams:", error);
    }
  };

  return { handleLike };
}

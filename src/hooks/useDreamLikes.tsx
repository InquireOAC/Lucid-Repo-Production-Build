
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

export function useDreamLikes(user: any, dream: DreamEntry) {
  const [likeCount, setLikeCount] = useState<number>(dream.like_count || 0);
  const [liked, setLiked] = useState<boolean>(!!dream.liked);

  useEffect(() => {
    if (!user) return;
    // Check if this dream is liked by current user
    supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("dream_id", dream.id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [user, dream.id]);

  const handleLikeToggle = async () => {
    if (!user) return;
    if (liked) {
      // Remove like
      await supabase.from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("dream_id", dream.id);
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      // Add like
      await supabase.from("likes")
        .insert([{ user_id: user.id, dream_id: dream.id }]);
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  return { likeCount, liked, handleLikeToggle };
}

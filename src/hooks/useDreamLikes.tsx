
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

export function useDreamLikes(user: any, dream: DreamEntry) {
  const [likeCount, setLikeCount] = useState<number>(dream.like_count || 0);
  const [liked, setLiked] = useState<boolean>(!!dream.liked);
  // Guards against the read-modify-write race when a user double-taps the like
  // button: overlapping toggles previously fought over the count.
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("dream_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("dream_id", dream.id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [user, dream.id]);

  const handleLikeToggle = async () => {
    if (!user || busy) return;
    setBusy(true);

    const next = !liked;
    // Optimistic UI — reverted below if the write fails.
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      if (next) {
        // Idempotent like: only insert if not already present (avoids duplicate
        // rows / unique-violation throw under rapid toggles).
        const { data: existing } = await supabase
          .from("dream_likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("dream_id", dream.id)
          .maybeSingle();
        if (!existing) {
          await supabase.from("dream_likes").insert([{ user_id: user.id, dream_id: dream.id }]);
        }
      } else {
        await supabase.from("dream_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("dream_id", dream.id);
      }

      // Reconcile with the authoritative count from the DB.
      const { count } = await supabase
        .from("dream_likes")
        .select("id", { count: "exact", head: true })
        .eq("dream_id", dream.id);
      const newCount = count ?? 0;
      setLikeCount(newCount);
      await supabase
        .from("dream_entries")
        .update({ like_count: newCount })
        .eq("id", dream.id);
    } catch (e) {
      // Revert the optimistic change on failure.
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      console.error("[useDreamLikes] toggle failed", e);
    } finally {
      setBusy(false);
    }
  };

  return { likeCount, liked, handleLikeToggle, busy };
}

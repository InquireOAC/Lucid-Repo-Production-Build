
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Reads/writes the canonical `dream_comments` table — the same table used by
// DreamComments.tsx, useDreams, the discovery/feed enrichment, and the
// comment_count + activity DB triggers. Previously this hook used a separate
// `comments` table, which fragmented comments across two tables and left
// counts inconsistent.
export function useDreamComments(dreamId: string | undefined) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchComments() {
    if (!dreamId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("dream_comments")
      .select("*, profiles:user_id(username, display_name, avatar_url, avatar_symbol, avatar_color)")
      .eq("dream_id", dreamId)
      .order("created_at", { ascending: true });
    if (!error) setComments(data || []);
    setIsLoading(false);
  }

  async function addComment(user: any, comment_text: string) {
    if (!user || !dreamId || !comment_text) return;
    await supabase
      .from("dream_comments")
      .insert([{ user_id: user.id, dream_id: dreamId, content: comment_text }]);
    fetchComments();
  }

  async function deleteComment(commentId: string, user: any) {
    if (!user || !commentId) return;
    await supabase.from("dream_comments").delete().eq("id", commentId).eq("user_id", user.id);
    fetchComments();
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dreamId]);

  return { comments, isLoading, fetchComments, addComment, deleteComment };
}


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDreamComments(dreamId: string|undefined) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchComments() {
    if (!dreamId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles:user_id(username, profile_picture)")
      .eq("dream_id", dreamId)
      .order("created_at", { ascending: true });
    if (!error) setComments(data);
    setIsLoading(false);
  }

  async function addComment(user: any, comment_text: string) {
    if (!user || !dreamId || !comment_text) return;
    await supabase.from("comments").insert([{ user_id: user.id, dream_id: dreamId, comment_text }]);
    fetchComments();
  }

  async function deleteComment(commentId: string, user: any) {
    if (!user || !commentId) return;
    await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
    fetchComments();
  }

  useEffect(() => { fetchComments(); }, [dreamId]);

  return { comments, isLoading, fetchComments, addComment, deleteComment };
}

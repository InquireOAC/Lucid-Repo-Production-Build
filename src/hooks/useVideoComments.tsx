import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useVideoComments(videoId: string | undefined) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchComments() {
    if (!videoId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("video_comments")
      .select("*, profiles:user_id(username, profile_picture)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setIsLoading(false);
  }

  async function addComment(user: any, comment_text: string) {
    if (!user || !videoId || !comment_text) return;
    const { error } = await supabase.from("video_comments").insert([{ user_id: user.id, video_id: videoId, comment_text }]);
    if (error) {
      console.error("Error adding comment:", error);
    } else {
      fetchComments();
    }
  }

  async function deleteComment(commentId: string, user: any) {
    if (!user || !commentId) return;
    await supabase.from("video_comments").delete().eq("id", commentId).eq("user_id", user.id);
    fetchComments();
  }

  useEffect(() => { fetchComments(); }, [videoId]);

  return { comments, isLoading, fetchComments, addComment, deleteComment };
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

// Show recent public dreams from users the current user follows
export function useFeedPublicDreams(user: any) {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Query: dreams where is_public true, user_id in followed list
    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get followed user IDs
        const { data: following } = await supabase
          .from("follows")
          .select("followed_id")
          .eq("follower_id", user.id);
        const followedIds = following?.map(row => row.followed_id) || [];

        if (!followedIds.length) {
          setDreams([]);
          setIsLoading(false);
          return;
        }

        const { data: dreamsRaw, error } = await supabase
          .from("dream_entries")
          .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
          .eq("is_public", true)
          .in("user_id", followedIds)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        // Counts come from the denormalized like_count/comment_count columns on
        // dream_entries (kept current by DB triggers) instead of a per-dream
        // count query — that was an N+1 (3 queries × up to 50 dreams). Which
        // dreams the current user liked is resolved in ONE batched query.
        const rows = dreamsRaw || [];
        const ids = rows.map((d: any) => d.id);
        let likedSet = new Set<string>();
        if (user && ids.length) {
          const { data: myLikes } = await supabase
            .from("dream_likes")
            .select("dream_id")
            .eq("user_id", user.id)
            .in("dream_id", ids);
          likedSet = new Set((myLikes || []).map((r: any) => r.dream_id));
        }

        const dreamsWithCounts = rows.map((dream: any) => ({
          ...dream,
          isPublic: dream.is_public,
          likeCount: dream.like_count || 0,
          like_count: dream.like_count || 0,
          commentCount: dream.comment_count || 0,
          comment_count: dream.comment_count || 0,
          liked: likedSet.has(dream.id),
          userId: dream.user_id,
          profiles: dream.profiles,
          // pass down avatar
          avatarSymbol: dream.profiles?.avatar_symbol || null,
          avatarColor: dream.profiles?.avatar_color || null,
          // Ensure image URLs are properly normalized
          generatedImage: dream.generatedImage || dream.image_url || null,
          image_url: dream.image_url || dream.generatedImage || null,
          // Ensure audio URL is available
          audio_url: dream.audio_url || null,
          audioUrl: dream.audio_url || null,
        }));

        setDreams(dreamsWithCounts);
      } catch (err: any) {
        console.error("Error fetching following dreams:", err);
        setError(err?.message || "Failed to load feed");
        setDreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [user]);

  return { dreams, isLoading, error };
}

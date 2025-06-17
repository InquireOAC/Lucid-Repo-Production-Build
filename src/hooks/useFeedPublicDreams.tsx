
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

// Show recent public dreams from users the current user follows
export function useFeedPublicDreams(user: any) {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Query: dreams where is_public true, user_id in followed list
    const fetchFeed = async () => {
      setIsLoading(true);
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
          .select("*, profiles:user_id(username, display_name, avatar_url, avatar_symbol, avatar_color)")
          .eq("is_public", true)
          .in("user_id", followedIds)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        // For each dream, get the actual like count and comment count from the database
        const dreamsWithCounts = await Promise.all(
          (dreamsRaw || []).map(async (dream: any) => {
            // Get actual like count
            const { count: likeCount } = await supabase
              .from("dream_likes")
              .select("id", { count: "exact", head: true })
              .eq("dream_id", dream.id);

            // Get actual comment count
            const { count: commentCount } = await supabase
              .from("dream_comments")
              .select("id", { count: "exact", head: true })
              .eq("dream_id", dream.id);

            // Check if current user has liked this dream
            let userLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from("dream_likes")
                .select("id")
                .eq("dream_id", dream.id)
                .eq("user_id", user.id)
                .maybeSingle();
              userLiked = !!likeData;
            }

            return {
              ...dream,
              isPublic: dream.is_public,
              likeCount: likeCount || 0,
              like_count: likeCount || 0,
              commentCount: commentCount || 0,
              comment_count: commentCount || 0,
              liked: userLiked,
              userId: dream.user_id,
              profiles: dream.profiles,
              // pass down avatar
              avatarSymbol: dream.profiles?.avatar_symbol || null,
              avatarColor: dream.profiles?.avatar_color || null,
              // Ensure image URLs are properly normalized
              generatedImage: dream.generatedImage || dream.image_url || null,
              image_url: dream.image_url || dream.generatedImage || null,
            };
          })
        );

        setDreams(dreamsWithCounts);
      } catch (error) {
        console.error("Error fetching following dreams:", error);
        setDreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [user]);

  return { dreams, isLoading };
}

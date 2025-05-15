
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
      // Get followed user IDs
      const { data: following } = await supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", user.id);
      const followedIds = following.map(row => row.followed_id);

      if (!followedIds.length) {
        setDreams([]);
        setIsLoading(false);
        return;
      }

      const { data: dreamsRaw } = await supabase
        .from("dream_entries")
        .select("*, profiles:user_id(username, profile_picture)")
        .eq("is_public", true)
        .in("user_id", followedIds)
        .order("created_at", { ascending: false })
        .limit(50);

      setDreams(dreamsRaw || []);
      setIsLoading(false);
    };

    fetchFeed();
  }, [user]);

  return { dreams, isLoading };
}

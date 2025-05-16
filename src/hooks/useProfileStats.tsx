
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfileStats(user: any, userId?: string) {
  const [dreamCount, setDreamCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const fetchUserStats = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    try {
      // Get dream count
      const { data: dreams, error: dreamsError } = await supabase
        .from("dream_entries")
        .select("id")
        .eq("user_id", targetUserId)
        .eq("is_public", true);
      
      if (!dreamsError) {
        setDreamCount(dreams?.length || 0);
      }
      
      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);
      
      if (!followersError) {
        setFollowersCount(followers || 0);
      }
      
      // Get following count
      const { count: following, error: followingError } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);
      
      if (!followingError) {
        setFollowingCount(following || 0);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  
  return {
    dreamCount,
    followersCount,
    followingCount,
    setFollowersCount,
    setFollowingCount, // <-- Added this line
    fetchUserStats
  };
}


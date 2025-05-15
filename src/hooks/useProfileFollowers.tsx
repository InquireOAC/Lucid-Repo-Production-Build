
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fetch following/followers lists and counts for a given user/profile id
export function useProfileFollowers(userId?: string) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchFollowers = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("follows")
      .select("follower_id, profiles: follower_id(username, profile_picture)")
      .eq("followed_id", userId);
    if (!error) {
      setFollowers(data.map(f => f.profiles));
      setFollowersCount(data.length);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("follows")
      .select("followed_id, profiles: followed_id(username, profile_picture)")
      .eq("follower_id", userId);
    if (!error) {
      setFollowing(data.map(f => f.profiles));
      setFollowingCount(data.length);
    }
  };

  useEffect(() => {
    fetchFollowers();
    fetchFollowing();
    // eslint-disable-next-line
  }, [userId]);

  return {
    followers, following,
    followersCount, followingCount,
    fetchFollowers, fetchFollowing,
  };
}

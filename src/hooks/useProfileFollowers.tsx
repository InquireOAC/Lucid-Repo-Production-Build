
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fetch following/followers lists and counts for a given user/profile id
export function useProfileFollowers(userId?: string) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch all users who follow this user
  const fetchFollowers = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("follows")
      .select("follower_id, follower:profiles!follower_id(id,username,profile_picture,display_name,avatar_url)")
      .eq("followed_id", userId);
    if (!error && data) {
      setFollowers(data.map(f => f.follower));
      setFollowersCount(data.length);
    }
  };

  // Fetch all users this user follows
  const fetchFollowing = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("follows")
      .select("followed_id, followed:profiles!followed_id(id,username,profile_picture,display_name,avatar_url)")
      .eq("follower_id", userId);
    if (!error && data) {
      setFollowing(data.map(f => f.followed));
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

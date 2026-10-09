
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
      .select("follower_id, follower:public_profiles!follower_id(id,username,display_name,avatar_url,avatar_symbol,avatar_color)")
      .eq("followed_id", userId);

    if (!error && data) {
      const followerUsers = data.map(f => f.follower).filter(Boolean);
      setFollowers(followerUsers);
      setFollowersCount(followerUsers.length);
    } else {
      setFollowers([]);
      setFollowersCount(0);
    }
  };

  // Fetch all users this user follows
  const fetchFollowing = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("follows")
      .select("followed_id, followed:public_profiles!followed_id(id,username,display_name,avatar_url,avatar_symbol,avatar_color)")
      .eq("follower_id", userId);

    if (!error && data) {
      const followedUsers = data.map(f => f.followed).filter(Boolean);
      setFollowing(followedUsers);
      setFollowingCount(followedUsers.length);
    } else {
      setFollowing([]);
      setFollowingCount(0);
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

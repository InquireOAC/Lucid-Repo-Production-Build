
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import fetchUserStats type for count updates (will use setFollowersCount/setFollowingCount)
export function useFollowing(
  user: any,
  userId?: string,
  setFollowersCount?: (value: React.SetStateAction<number>) => void,
  setFollowingCount?: (value: React.SetStateAction<number>) => void,
  fetchUserStats?: () => Promise<void>
) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // Force UUID only, never username!
  const checkIfFollowing = async (targetUserId: string) => {
    if (!user) return;
    // Ensure targetUserId is a UUID
    if (!/^[0-9a-fA-F-]{36}$/.test(targetUserId)) return;
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followed_id", targetUserId)
        .maybeSingle();
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    // Only allow if userId is a UUID and not a username
    if (!user || isOwnProfile || !userId || !/^[0-9a-fA-F-]{36}$/.test(userId)) return;
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("followed_id", userId);

        if (error) throw error;
        setIsFollowing(false);
        if (setFollowersCount) setFollowersCount(prev => Math.max(0, prev - 1));
        // Ensure following count updates on own profile
        if (setFollowingCount && !isOwnProfile) setFollowingCount(prev => Math.max(0, prev - 1));
        toast.success("Unfollowed user");
      } else {
        const { error } = await supabase
          .from("follows")
          .upsert({ follower_id: user.id, followed_id: userId });
        if (error) throw error;
        setIsFollowing(true);
        if (setFollowersCount) setFollowersCount(prev => prev + 1);
        // Ensure following count updates on own profile
        if (setFollowingCount && !isOwnProfile) setFollowingCount(prev => prev + 1);
        toast.success("Now following user");
      }
      // Immediately refetch stats/counts after follow/unfollow
      if (fetchUserStats) await fetchUserStats();
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow");
    }
    checkIfFollowing(userId ?? "");
  };

  return {
    isFollowing,
    setIsFollowing,
    isOwnProfile,
    setIsOwnProfile,
    checkIfFollowing,
    handleFollow,
  };
}

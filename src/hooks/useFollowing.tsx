
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFollowing(user: any, userId?: string, setFollowersCount?: (value: React.SetStateAction<number>) => void) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  const checkIfFollowing = async (targetUserId: string) => {
    if (!user) return;

    try {
      // Use correct table/columns for following
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
    if (!user || isOwnProfile || !userId) return;

    try {
      if (isFollowing) {
        // Unfollow: remove row from follows
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("followed_id", userId);

        if (error) throw error;
        setIsFollowing(false);
        if (setFollowersCount) setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success("Unfollowed user");
      } else {
        // Follow: add row to follows
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, followed_id: userId });

        if (error) throw error;
        setIsFollowing(true);
        if (setFollowersCount) setFollowersCount(prev => prev + 1);
        toast.success("Now following user");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow");
    }
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

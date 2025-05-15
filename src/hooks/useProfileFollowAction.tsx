
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Use this for follow/unfollow action on a given userId/profile
export function useProfileFollowAction(user: any, theirUserId: string|undefined, onChange?: () => void) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Check if the current user follows the profile being viewed
  const checkFollowing = useCallback(async () => {
    if (!user || !theirUserId) {
      setIsFollowing(false);
      return;
    }
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("followed_id", theirUserId)
      .maybeSingle();
    setIsFollowing(!!data);
  }, [user, theirUserId]);

  // Toggle follow/unfollow in the DB and update state accordingly
  const handleFollow = async () => {
    if (!user || !theirUserId) return;
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("followed_id", theirUserId);
      setIsFollowing(false);
    } else {
      await supabase
        .from("follows")
        .upsert([
          { follower_id: user.id, followed_id: theirUserId }
        ]);
      setIsFollowing(true);
    }
    onChange?.();
    // Re-check following state
    checkFollowing();
  };

  return { isFollowing, checkFollowing, handleFollow, setIsFollowing };
}

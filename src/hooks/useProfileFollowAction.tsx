
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Use this for follow/unfollow action on a given userId/profile
export function useProfileFollowAction(user: any, theirUserId: string|undefined, onChange?: () => void) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  async function checkFollowing() {
    if (!user || !theirUserId) return;
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("followed_id", theirUserId)
      .maybeSingle();
    setIsFollowing(!!data);
  }

  async function handleFollow() {
    if (!user || !theirUserId) return;
    if (isFollowing) {
      // Unfollow
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("followed_id", theirUserId);
      setIsFollowing(false);
    } else {
      // Follow
      await supabase
        .from("follows")
        .insert([{ follower_id: user.id, followed_id: theirUserId }]);
      setIsFollowing(true);
    }
    onChange?.();
  }

  return { isFollowing, checkFollowing, handleFollow };
}

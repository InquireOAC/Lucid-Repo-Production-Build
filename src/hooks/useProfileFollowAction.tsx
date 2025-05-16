
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Simple UUID validation
function isUUID(str: string|undefined): boolean {
  return typeof str === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Use this for follow/unfollow action on a given userId/profile
export function useProfileFollowAction(user: any, theirUserId: string|undefined, onChange?: () => void) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if the current user follows the profile being viewed
  const checkFollowing = useCallback(async () => {
    if (!user || !theirUserId) {
      setIsFollowing(false);
      return;
    }
    if (!isUUID(user.id) || !isUUID(theirUserId)) {
      setIsFollowing(false);
      if (process.env.NODE_ENV === "development") {
        console.warn("[useProfileFollowAction] Invalid UUID in follow check:", { userId: user.id, theirUserId });
      }
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followed_id", theirUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, theirUserId]);

  // Toggle follow/unfollow in the DB and update state accordingly
  const handleFollow = async () => {
    if (!user || !theirUserId) return;

    if (!isUUID(user.id) || !isUUID(theirUserId)) {
      toast.error("Invalid profile identifier (not a UUID), cannot follow user.");
      if (process.env.NODE_ENV === "development") {
        console.warn("[useProfileFollowAction] Attempted to follow with invalid UUIDs:", { userId: user.id, theirUserId });
      }
      return;
    }

    try {
      setIsLoading(true);
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("followed_id", theirUserId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success("Unfollowed user");
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert([
            { follower_id: user.id, followed_id: theirUserId }
          ]);

        if (error) throw error;
        setIsFollowing(true);
        toast.success("Now following user");
      }

      // Call the onChange callback if provided
      if (onChange) onChange();
    } catch (error: any) {
      console.error("Error updating follow status:", error);
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkFollowing();
  }, [checkFollowing]);

  return { isFollowing, isLoading, checkFollowing, handleFollow, setIsFollowing };
}


import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFollowing(user: any, userId?: string, setFollowersCount?: (value: React.SetStateAction<number>) => void) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  const checkIfFollowing = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        throw error;
      }
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };
  
  const handleFollow = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        
        setIsFollowing(false);
        if (setFollowersCount) {
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
        toast.success("Unfollowed user");
      } else {
        // Follow
        await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: userId });
        
        setIsFollowing(true);
        if (setFollowersCount) {
          setFollowersCount(prev => prev + 1);
        }
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
    handleFollow
  };
}

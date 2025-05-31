
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    if (!user) {
      setBlockedUserIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select("blocked_user_id")
        .eq("blocker_user_id", user.id);

      if (error) throw error;
      
      const blockedIds = new Set(data.map(item => item.blocked_user_id));
      setBlockedUserIds(blockedIds);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [user]);

  const isUserBlocked = (userId: string): boolean => {
    return blockedUserIds.has(userId);
  };

  const blockUser = (userId: string) => {
    setBlockedUserIds(prev => new Set([...prev, userId]));
  };

  const unblockUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_user_id", user.id)
        .eq("blocked_user_id", userId);

      if (error) throw error;
      
      setBlockedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  };

  return {
    blockedUserIds,
    isLoading,
    isUserBlocked,
    blockUser,
    unblockUser,
    refetchBlockedUsers: fetchBlockedUsers
  };
};

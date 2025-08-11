import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription for new messages
    if (user) {
      const channel = supabase
        .channel('unread_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            fetchUnreadCount();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    unreadCount,
    refetch: fetchUnreadCount
  };
};
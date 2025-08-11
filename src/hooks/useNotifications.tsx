import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  user_id: string;
  target_user_id: string;
  dream_id?: string;
  created_at: string;
  read?: boolean;
  user?: {
    display_name?: string;
    username?: string;
    avatar_symbol?: string;
    avatar_color?: string;
  };
  dream?: {
    title?: string;
    content?: string;
  };
  message_content?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First, get activities that represent notifications
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id,
          type,
          user_id,
          target_user_id,
          dream_id,
          created_at
        `)
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        return;
      }

      if (!activities || activities.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Get user info for each notification
      const userIds = [...new Set(activities.map(a => a.user_id))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_symbol, avatar_color')
        .in('id', userIds);

      // Get dream info for dream-related notifications
      const dreamIds = activities.filter(a => a.dream_id).map(a => a.dream_id);
      const { data: dreams } = dreamIds.length > 0 ? await supabase
        .from('dream_entries')
        .select('id, title, content')
        .in('id', dreamIds) : { data: [] };

      // Combine the data
      const enrichedNotifications: Notification[] = activities.map(activity => {
        const activityUser = users?.find(u => u.id === activity.user_id);
        const dream = dreams?.find(d => d.id === activity.dream_id);
        
        return {
          ...activity,
          user: activityUser,
          dream: dream,
        };
      });

      setNotifications(enrichedNotifications);
      
      // Count unread notifications (for now, we'll consider all as read after 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const unread = enrichedNotifications.filter(n => 
        new Date(n.created_at) > oneDayAgo
      ).length;
      setUnreadCount(unread);

    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    // For now, just update locally since we don't have a read status in activities table
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for new activities
    if (user) {
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
            filter: `target_user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
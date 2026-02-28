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
    avatar_url?: string;
  };
  dream?: {
    title?: string;
    content?: string;
  };
  comment_text?: string;
  message_content?: string;
}

const STORAGE_KEY = "lucid_repo_read_notifications";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  // Keep max 200 to avoid bloat
  const arr = [...ids].slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
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
      const userIds = [...new Set(activities.map(a => a.user_id).filter(Boolean))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_symbol, avatar_color, avatar_url')
        .in('id', userIds);

      // Get dream info for dream-related notifications
      const dreamIds = activities.filter(a => a.dream_id).map(a => a.dream_id);
      const { data: dreams } = dreamIds.length > 0 ? await supabase
        .from('dream_entries')
        .select('id, title, content')
        .in('id', dreamIds) : { data: [] };

      // Get comment text for comment notifications
      const commentActivities = activities.filter(a => a.type === 'comment' && a.dream_id);
      let commentMap: Record<string, string> = {};
      if (commentActivities.length > 0) {
        // For each comment activity, fetch the most recent comment by that user on that dream
        const { data: comments } = await supabase
          .from('dream_comments')
          .select('dream_id, user_id, content, created_at')
          .in('dream_id', commentActivities.map(a => a.dream_id!))
          .in('user_id', commentActivities.map(a => a.user_id!))
          .order('created_at', { ascending: false });
        
        if (comments) {
          for (const c of comments) {
            const key = `${c.user_id}_${c.dream_id}`;
            if (!commentMap[key]) commentMap[key] = c.content;
          }
        }
      }

      // Combine the data
      const enrichedNotifications: Notification[] = activities.map(activity => {
        const activityUser = users?.find(u => u.id === activity.user_id);
        const dream = dreams?.find(d => d.id === activity.dream_id);
        const commentKey = `${activity.user_id}_${activity.dream_id}`;
        
        return {
          ...activity,
          user: activityUser,
          dream: dream,
          comment_text: commentMap[commentKey],
        };
      });

      setNotifications(enrichedNotifications);
      
      // Count unread using localStorage
      const readIds = getReadIds();
      const unread = enrichedNotifications.filter(n => !readIds.has(n.id)).length;
      setUnreadCount(unread);

    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const readIds = getReadIds();
    readIds.add(notificationId);
    saveReadIds(readIds);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const readIds = getReadIds();
    notifications.forEach(n => readIds.add(n.id));
    saveReadIds(readIds);
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
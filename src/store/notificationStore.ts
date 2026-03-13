import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface NotificationUser {
  display_name?: string;
  username?: string;
  avatar_symbol?: string;
  avatar_color?: string;
  avatar_url?: string;
}

interface NotificationDream {
  title?: string;
  content?: string;
}

export interface Notification {
  id: string;
  type: string;
  user_id: string;
  target_user_id: string;
  dream_id?: string;
  created_at: string;
  read?: boolean;
  user?: NotificationUser;
  dream?: NotificationDream;
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
  const arr = [...ids].slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

interface NotificationStore {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  loading: true,
  unreadCount: 0,

  fetchNotifications: async (userId: string) => {
    try {
      set({ loading: true });

      const { data: activities, error } = await supabase
        .from('activities')
        .select('id, type, user_id, target_user_id, dream_id, created_at')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      if (!activities || activities.length === 0) {
        set({ notifications: [], unreadCount: 0 });
        return;
      }

      const userIds = [...new Set(activities.map(a => a.user_id).filter(Boolean))];
      const dreamIds = activities.filter(a => a.dream_id).map(a => a.dream_id);

      const [{ data: users }, dreamsResult] = await Promise.all([
        supabase.from('profiles').select('id, display_name, username, avatar_symbol, avatar_color, avatar_url').in('id', userIds),
        dreamIds.length > 0
          ? supabase.from('dream_entries').select('id, title, content').in('id', dreamIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const commentActivities = activities.filter(a => a.type === 'comment' && a.dream_id);
      let commentMap: Record<string, string> = {};
      if (commentActivities.length > 0) {
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

      const dreams = dreamsResult?.data || [];
      const readIds = getReadIds();

      const enriched: Notification[] = activities.map(activity => ({
        ...activity,
        user: users?.find(u => u.id === activity.user_id),
        dream: dreams?.find((d: any) => d.id === activity.dream_id),
        comment_text: commentMap[`${activity.user_id}_${activity.dream_id}`],
        read: readIds.has(activity.id),
      }));

      const unread = enriched.filter(n => !n.read).length;
      set({ notifications: enriched, unreadCount: unread });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: (notificationId: string) => {
    const readIds = getReadIds();
    readIds.add(notificationId);
    saveReadIds(readIds);
    set(state => ({
      notifications: state.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    const readIds = getReadIds();
    get().notifications.forEach(n => readIds.add(n.id));
    saveReadIds(readIds);
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Announcement {
  id: string;
  created_by: string;
  type: string;
  title: string;
  content: string;
  link_url: string | null;
  priority: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  metadata: any;
}

const priorityOrder: Record<string, number> = { high: 3, normal: 2, low: 1 };

export const useAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }

    const [{ data: anns }, { data: dismissals }] = await Promise.all([
      supabase
        .from('platform_announcements')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('announcement_dismissals')
        .select('announcement_id')
        .eq('user_id', user.id),
    ]);

    const dismissed = new Set((dismissals || []).map((d: any) => d.announcement_id));
    setDismissedIds(dismissed);

    const active = (anns || [])
      .filter((a: Announcement) => !a.expires_at || new Date(a.expires_at) > new Date())
      .sort((a: Announcement, b: Announcement) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

    setAnnouncements(active);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel('platform_announcements_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_announcements' }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAnnouncements]);

  const dismissAnnouncement = async (announcementId: string) => {
    if (!user) return;
    setDismissedIds(prev => new Set([...prev, announcementId]));
    await supabase.from('announcement_dismissals').insert({
      user_id: user.id,
      announcement_id: announcementId,
    });
  };

  const currentAnnouncement = announcements.find(a => !dismissedIds.has(a.id)) || null;

  return { announcements, currentAnnouncement, dismissAnnouncement, isLoading, refetch: fetchAnnouncements };
};

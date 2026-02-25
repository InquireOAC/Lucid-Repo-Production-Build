import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalDreams: number;
  publicDreams: number;
  flaggedContent: number;
  activeAnnouncements: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDreams: 0,
    publicDreams: 0,
    flaggedContent: 0,
    activeAnnouncements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: userCount },
        { count: dreamCount },
        { count: publicCount },
        { count: flagCount },
        { count: annCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('dream_entries').select('*', { count: 'exact', head: true }),
        supabase.from('dream_entries').select('*', { count: 'exact', head: true }).eq('is_public', true),
        supabase.from('content_flags').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('platform_announcements').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalDreams: dreamCount || 0,
        publicDreams: publicCount || 0,
        flaggedContent: flagCount || 0,
        activeAnnouncements: annCount || 0,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};

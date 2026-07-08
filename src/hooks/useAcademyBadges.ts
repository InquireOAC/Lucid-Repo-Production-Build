import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AcademyBadge {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  earned: boolean;
  earned_at?: string;
}

export function useAcademyBadges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['academy-badges', user?.id],
    queryFn: async () => {
      const { data: badges, error } = await supabase
        .from('academy_badges')
        .select('*');
      if (error) throw error;

      let earnedMap = new Map<string, string>();
      if (user) {
        const { data: earned } = await supabase
          .from('academy_user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', user.id);
        earnedMap = new Map((earned || []).map(e => [e.badge_id, e.earned_at]));
      }

      return (badges || []).map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        category: b.category,
        icon: b.icon,
        earned: earnedMap.has(b.id),
        earned_at: earnedMap.get(b.id),
      })) as AcademyBadge[];
    },
  });
}

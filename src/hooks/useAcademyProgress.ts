import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const TIER_THRESHOLDS = [
  { tier: 1, name: 'Sleeper', xp: 0, icon: 'moon' },
  { tier: 2, name: 'Dreamer', xp: 500, icon: 'cloud' },
  { tier: 3, name: 'Lucid Explorer', xp: 1500, icon: 'telescope' },
  { tier: 4, name: 'Oneironaut', xp: 4000, icon: 'rocket' },
  { tier: 5, name: 'Astral Architect', xp: 10000, icon: 'building' },
];

export function getTierInfo(tier: number) {
  return TIER_THRESHOLDS.find(t => t.tier === tier) || TIER_THRESHOLDS[0];
}

export function getNextTierInfo(currentXP: number) {
  const next = TIER_THRESHOLDS.find(t => t.xp > currentXP);
  if (!next) return null;
  const prev = TIER_THRESHOLDS.filter(t => t.xp <= currentXP).pop() || TIER_THRESHOLDS[0];
  const progress = ((currentXP - prev.xp) / (next.xp - prev.xp)) * 100;
  return { ...next, progress, xpNeeded: next.xp - currentXP };
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2;
  if (streak >= 7) return 1.5;
  return 1;
}

export function useAcademyProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['academy-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('academy_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const initProgress = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('academy_user_progress')
        .upsert({ user_id: user.id, total_xp: 0, current_tier: 1 }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academy-progress'] }),
  });

  return { progress, isLoading, initProgress };
}

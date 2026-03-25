import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getStreakMultiplier, TIER_THRESHOLDS } from './useAcademyProgress';
import { toast } from 'sonner';

export function useAcademyXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const awardXP = useMutation({
    mutationFn: async (params: {
      amount: number;
      source: 'lesson' | 'quiz' | 'module_complete' | 'dream_log' | 'lucid_dream' | 'challenge' | 'streak_bonus';
      referenceId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get current progress
      const { data: progress } = await supabase
        .from('academy_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentStreak = progress?.current_streak || 0;
      const multiplier = getStreakMultiplier(currentStreak);
      const finalAmount = Math.round(params.amount * multiplier);
      const newTotal = (progress?.total_xp || 0) + finalAmount;

      // Determine new tier
      let newTier = 1;
      for (const t of TIER_THRESHOLDS) {
        if (newTotal >= t.xp) newTier = t.tier;
      }
      const tierChanged = newTier > (progress?.current_tier || 1);

      // Insert XP transaction
      await supabase.from('academy_xp_transactions').insert({
        user_id: user.id,
        amount: params.amount,
        multiplier,
        final_amount: finalAmount,
        source: params.source,
        reference_id: params.referenceId,
      });

      // Update progress
      await supabase.from('academy_user_progress').upsert({
        user_id: user.id,
        total_xp: newTotal,
        current_tier: newTier,
        current_streak: progress?.current_streak || 0,
        longest_streak: progress?.longest_streak || 0,
        streak_multiplier: multiplier,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (tierChanged) {
        const tierInfo = TIER_THRESHOLDS.find(t => t.tier === newTier);
        toast.success(`🎉 Tier Up! You're now a ${tierInfo?.name}!`);

        // Award tier badges
        const tierBadgeMap: Record<number, string> = {
          3: 'dream_walker',
          4: 'oneironaut',
          5: 'dream_architect',
        };
        if (tierBadgeMap[newTier]) {
          await supabase.from('academy_user_badges').upsert({
            user_id: user.id,
            badge_id: tierBadgeMap[newTier],
          }, { onConflict: 'user_id,badge_id' });
        }
      }

      return { finalAmount, multiplier, newTotal, newTier, tierChanged };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-progress'] });
      queryClient.invalidateQueries({ queryKey: ['academy-badges'] });
    },
  });

  return { awardXP };
}

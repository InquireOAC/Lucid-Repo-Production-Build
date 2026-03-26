import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const WeeklyChallengeCard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenge } = useQuery({
    queryKey: ['academy-weekly-challenge'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('academy_weekly_challenges')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: accepted } = useQuery({
    queryKey: ['academy-challenge-accepted', challenge?.id, user?.id],
    queryFn: async () => {
      if (!user || !challenge) return false;
      const { data } = await supabase
        .from('academy_user_challenge_progress')
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!challenge,
  });

  const acceptChallenge = useMutation({
    mutationFn: async () => {
      if (!user || !challenge) throw new Error('Missing data');
      const { error } = await supabase
        .from('academy_user_challenge_progress')
        .upsert({ user_id: user.id, challenge_id: challenge.id }, { onConflict: 'user_id,challenge_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-challenge-accepted'] });
    },
  });

  if (!challenge) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Weekly Challenge</h2>
      <div className="rounded-2xl bg-[#0d1425] border border-primary/15 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <span className="text-3xl">✋</span>
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
            +{challenge.xp_reward} XP REWARD
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{challenge.title}</h3>
          {challenge.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
          )}
        </div>

        <Button
          variant="default"
          className="w-full rounded-xl h-12 text-base font-semibold"
          disabled={!!accepted}
          onClick={() => acceptChallenge.mutate()}
        >
          {accepted ? 'Challenge Accepted ✓' : 'Accept Challenge'}
        </Button>
      </div>
    </div>
  );
};

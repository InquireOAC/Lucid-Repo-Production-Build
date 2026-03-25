import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Clock } from 'lucide-react';

export const WeeklyChallengeCard: React.FC = () => {
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

  if (!challenge) return null;

  const daysLeft = Math.ceil(
    (new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-2xl bg-card border border-amber-500/20 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-foreground">Weekly Challenge</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{daysLeft}d left</span>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">{challenge.title}</p>
      {challenge.description && (
        <p className="text-xs text-muted-foreground">{challenge.description}</p>
      )}
      <p className="text-xs text-amber-400 font-medium">+{challenge.xp_reward} XP</p>
    </div>
  );
};

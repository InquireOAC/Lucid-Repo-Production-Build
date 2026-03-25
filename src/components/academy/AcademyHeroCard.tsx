import React from 'react';
import { getTierInfo, getNextTierInfo, TIER_THRESHOLDS } from '@/hooks/useAcademyProgress';
import { Progress } from '@/components/ui/progress';
import { Flame } from 'lucide-react';

interface AcademyHeroCardProps {
  totalXP: number;
  currentTier: number;
  currentStreak: number;
  longestStreak: number;
}

export const AcademyHeroCard: React.FC<AcademyHeroCardProps> = ({
  totalXP,
  currentTier,
  currentStreak,
  longestStreak,
}) => {
  const tier = getTierInfo(currentTier);
  const next = getNextTierInfo(totalXP);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-5 space-y-4">
      {/* Tier + XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tier.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-foreground">{tier.name}</h2>
            <p className="text-xs text-muted-foreground">Tier {tier.tier}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalXP.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total XP</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {next && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next: {next.icon} {next.name}</span>
            <span>{next.xpNeeded} XP to go</span>
          </div>
          <Progress value={next.progress} className="h-2.5 bg-muted/30" />
        </div>
      )}
      {!next && (
        <p className="text-sm text-primary/80 text-center font-medium">✨ Maximum tier reached!</p>
      )}

      {/* Streak */}
      <div className="flex items-center justify-center gap-6 pt-1">
        <div className="flex items-center gap-1.5">
          <Flame size={18} className="text-orange-400" />
          <span className="text-sm font-bold text-foreground">{currentStreak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="text-xs text-muted-foreground">
          Best: <span className="font-semibold text-foreground">{longestStreak}</span> days
        </div>
      </div>
    </div>
  );
};

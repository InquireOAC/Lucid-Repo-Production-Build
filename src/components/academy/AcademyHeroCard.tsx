import React from 'react';
import { getTierInfo, getNextTierInfo } from '@/hooks/useAcademyProgress';
import { Progress } from '@/components/ui/progress';

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
  const maxXP = next ? next.xp + next.xpNeeded - (next.xp - totalXP) : totalXP;
  const targetXP = next ? next.xp + next.xpNeeded : totalXP;

  return (
    <div className="rounded-2xl bg-[#0d1425] border border-border/20 p-5 space-y-5">
      {/* Rank + Level Progress */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary/70 font-medium mb-1">Current Rank</p>
          <h2 className="text-2xl font-bold text-foreground">{tier.name}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Level Progress</p>
          <p className="text-lg font-bold text-foreground">
            <span className="text-primary">{totalXP.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm font-normal"> / {next ? (totalXP + next.xpNeeded).toLocaleString() : totalXP.toLocaleString()} XP</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {next && (
        <Progress value={next.progress} className="h-2 bg-muted/20" />
      )}
      {!next && (
        <Progress value={100} className="h-2 bg-muted/20" />
      )}

      {/* Streak boxes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/30 bg-background/30 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Day Streak</p>
          <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
        </div>
        <div className="rounded-xl border border-border/30 bg-background/30 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Best Streak</p>
          <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
        </div>
      </div>
    </div>
  );
};

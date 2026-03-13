import React from "react";
import PageTransition from "@/components/ui/PageTransition";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useLucidStats } from "@/hooks/useLucidStats";
import { useLucidAchievements } from "@/hooks/useLucidAchievements";
import StatsHeroCard from "@/components/lucid-stats/StatsHeroCard";
import LucidFrequencyCard from "@/components/lucid-stats/LucidFrequencyCard";
import RecallStrengthCard from "@/components/lucid-stats/RecallStrengthCard";
import TechniqueEffectivenessCard from "@/components/lucid-stats/TechniqueEffectivenessCard";
import TriggerDetectionCard from "@/components/lucid-stats/TriggerDetectionCard";
import LucidityTrendCard from "@/components/lucid-stats/LucidityTrendCard";
import AICoachCard from "@/components/lucid-stats/AICoachCard";
import AchievementsCard from "@/components/lucid-stats/AchievementsCard";
import LoadingSkeletonStats from "@/components/lucid-stats/LoadingSkeletonStats";

const LucidStats: React.FC = () => {
  const { stats, isLoading, error, refetch, timeRange, setTimeRange } = useLucidStats();
  useLucidAchievements(stats);

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 py-6 space-y-4">
          <LoadingSkeletonStats />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 py-6">
          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground">Unable to load your stats.</p>
            <button onClick={() => refetch()} className="text-primary text-sm font-medium">Try Again</button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen pt-safe-top">
      <PullToRefresh onRefresh={() => refetch()}>
        <div className="px-4 py-6 space-y-4 pb-8">
          <StatsHeroCard stats={stats} />
          <LucidFrequencyCard stats={stats} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <RecallStrengthCard stats={stats} />
          <TechniqueEffectivenessCard stats={stats} />
          <TriggerDetectionCard stats={stats} />
          <LucidityTrendCard stats={stats} />
          <AICoachCard stats={stats} />
          <AchievementsCard stats={stats} />
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default LucidStats;

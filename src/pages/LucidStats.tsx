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
        <div className="px-4 md:px-8 py-6 space-y-4 max-w-6xl mx-auto">
          <LoadingSkeletonStats />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
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
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <div className="px-4 md:px-8 py-6 pb-8 max-w-6xl mx-auto">
          {/* Hero spans full width */}
          <div className="mb-4">
            <StatsHeroCard stats={stats} />
          </div>
          {/* Dashboard grid: 2-col on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LucidFrequencyCard stats={stats} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
            <RecallStrengthCard stats={stats} />
            <TechniqueEffectivenessCard stats={stats} />
            <TriggerDetectionCard stats={stats} />
            <LucidityTrendCard stats={stats} />
            <AICoachCard stats={stats} />
            <div className="lg:col-span-2">
              <AchievementsCard stats={stats} />
            </div>
          </div>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default LucidStats;

import React from "react";
import PageTransition from "@/components/ui/PageTransition";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useLucidStats } from "@/hooks/useLucidStats";
import { useLucidAchievements } from "@/hooks/useLucidAchievements";
import { useAuth } from "@/contexts/AuthContext";
import StatsHeroCard from "@/components/lucid-stats/StatsHeroCard";
import LucidFrequencyCard from "@/components/lucid-stats/LucidFrequencyCard";
import RecallStrengthCard from "@/components/lucid-stats/RecallStrengthCard";
import TechniqueEffectivenessCard from "@/components/lucid-stats/TechniqueEffectivenessCard";
import TriggerDetectionCard from "@/components/lucid-stats/TriggerDetectionCard";
import LucidityTrendCard from "@/components/lucid-stats/LucidityTrendCard";
import AICoachCard from "@/components/lucid-stats/AICoachCard";
import AchievementsCard from "@/components/lucid-stats/AchievementsCard";
import LoadingSkeletonStats from "@/components/lucid-stats/LoadingSkeletonStats";
import { Sparkles, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LucidStats: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading, error, refetch, timeRange, setTimeRange } = useLucidStats();
  useLucidAchievements(stats);

  // Auth guard
  if (!user) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 md:px-8 py-20 max-w-6xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-8 md:p-12 max-w-md mx-auto space-y-4">
            <Sparkles className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-xl font-bold text-foreground">Sign in to view your stats</h2>
            <p className="text-sm text-muted-foreground">Track your lucid dreaming progress with detailed analytics.</p>
            <Button onClick={() => navigate("/auth")} className="mt-2">Sign In</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 md:px-8 py-6 space-y-4 max-w-6xl mx-auto">
          <LoadingSkeletonStats />
        </div>
      </PageTransition>
    );
  }

  // Empty state — no stats data and no error (new user or RPC returned null)
  if (!stats && !error) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 md:px-8 py-20 max-w-6xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-8 md:p-12 max-w-md mx-auto space-y-4">
            <Moon className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-xl font-bold text-foreground">No stats yet</h2>
            <p className="text-sm text-muted-foreground">Log your first dream to start tracking your lucid dreaming journey.</p>
            <Button onClick={() => navigate("/journal/new")} className="mt-2">Log a Dream</Button>
          </div>
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

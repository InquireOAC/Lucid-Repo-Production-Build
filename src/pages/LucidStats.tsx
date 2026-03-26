import React from "react";
import PageTransition from "@/components/ui/PageTransition";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useLucidStats } from "@/hooks/useLucidStats";
import { useLucidAchievements } from "@/hooks/useLucidAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import StatsHeroCard from "@/components/lucid-stats/StatsHeroCard";
import LucidFrequencyCard from "@/components/lucid-stats/LucidFrequencyCard";
import RecallStrengthCard from "@/components/lucid-stats/RecallStrengthCard";
import TechniqueEffectivenessCard from "@/components/lucid-stats/TechniqueEffectivenessCard";
import TriggerDetectionCard from "@/components/lucid-stats/TriggerDetectionCard";
import LucidityTrendCard from "@/components/lucid-stats/LucidityTrendCard";
import AICoachCard from "@/components/lucid-stats/AICoachCard";
import AchievementsCard from "@/components/lucid-stats/AchievementsCard";
import LoadingSkeletonStats from "@/components/lucid-stats/LoadingSkeletonStats";
import { Sparkles, Moon, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SectionDivider = () => (
  <div className="py-1">
    <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
  </div>
);

const LucidStats: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasActiveSubscription } = useFeatureUsage();
  const { stats, isLoading, error, refetch, timeRange, setTimeRange } = useLucidStats();
  useLucidAchievements(stats);

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

  if (!hasActiveSubscription) {
    return (
      <PageTransition className="min-h-screen pt-safe-top">
        <div className="px-4 md:px-8 py-20 max-w-6xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-8 md:p-12 max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Premium Feature</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlock detailed lucid dreaming analytics, technique tracking, AI coaching insights, and achievement badges with a subscription.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>Available on Dreamer & Mystic plans</span>
            </div>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('show-paywall', { detail: { feature: 'analysis' } }))}
              className="mt-2 w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Unlock
            </Button>
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
        <div className="max-w-6xl mx-auto pb-10">
          {/* Hero */}
          <section className="px-5 md:px-8 pt-6 pb-8">
            <StatsHeroCard stats={stats} />
          </section>

          <SectionDivider />

          {/* Frequency + Recall */}
          <section className="px-5 md:px-8 py-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-8">
              <LucidFrequencyCard stats={stats} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
              <RecallStrengthCard stats={stats} />
            </div>
          </section>

          <SectionDivider />

          {/* Techniques + Triggers */}
          <section className="px-5 md:px-8 py-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-8">
              <TechniqueEffectivenessCard stats={stats} />
              <TriggerDetectionCard stats={stats} />
            </div>
          </section>

          <SectionDivider />

          {/* Lucidity Levels */}
          <section className="px-5 md:px-8 py-7">
            <LucidityTrendCard stats={stats} />
          </section>

          <SectionDivider />

          {/* AI Coach */}
          <section className="px-5 md:px-8 py-7">
            <AICoachCard stats={stats} />
          </section>

          <SectionDivider />

          {/* Achievements */}
          <section className="px-5 md:px-8 py-7">
            <AchievementsCard stats={stats} />
          </section>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default LucidStats;

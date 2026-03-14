import React from "react";
import { Sparkles, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
}

const StatsHeroCard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();
  const hasData = stats && stats.total_entries > 0;

  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Lucid Stats</h1>
        </div>
        <p className="text-muted-foreground">Start logging dreams to unlock your personal lucid dreaming analytics.</p>
        <Button onClick={() => navigate("/journal/new")} variant="aurora" size="sm">Log Your First Dream</Button>
      </div>
    );
  }

  const topTechnique = stats.techniques.length > 0
    ? stats.techniques.reduce((a, b) => (a.rate > b.rate ? a : b))
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Lucid Stats</h1>
      </div>

      {stats.latest_insight?.summary_message ? (
        <p className="text-sm text-muted-foreground">{stats.latest_insight.summary_message}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Your dream practice overview.</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <MetricPill label="Lucid This Month" value={stats.lucid_this_month} icon={<Moon className="h-3.5 w-3.5" />} />
        <MetricPill label="Recall Streak" value={`${stats.current_recall_streak}d`} icon={<span className="text-xs">🔥</span>} />
        <MetricPill
          label="Top Technique"
          value={topTechnique ? topTechnique.technique : "—"}
          icon={<span className="text-xs">⚡</span>}
        />
      </div>
    </div>
  );
};

function MetricPill({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-primary/10 backdrop-blur-sm p-3 text-center space-y-1 border border-primary/20">
      <div className="flex items-center justify-center gap-1">{icon}<span className="text-lg font-bold text-foreground">{value}</span></div>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

export default StatsHeroCard;

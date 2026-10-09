import React from "react";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
}

const levelLabels: Record<string, string> = {
  "1": "Slight Awareness",
  "2": "Moderate Control",
  "3": "Full Control",
};

const levelColors: Record<string, string> = {
  "1": "bg-primary/30",
  "2": "bg-primary/60",
  "3": "bg-primary",
};

const LucidityTrendCard: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;

  const dist = stats.level_distribution;
  const total = Object.values(dist).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Lucidity Levels</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Rate your lucidity level on lucid dreams to track your control over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Lucidity Levels</h2>
        <span className="text-sm font-bold text-primary">{stats.avg_lucidity_level} avg</span>
      </div>

      <div className="flex h-4 rounded-full overflow-hidden bg-muted/20">
        {["1", "2", "3"].map((level) => {
          const count = dist[level] ?? 0;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={level}
              className={`${levelColors[level]} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${levelLabels[level]}: ${count}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3"].map((level) => (
          <div key={level} className="text-center space-y-1">
            <div className={`w-3 h-3 rounded-full mx-auto ${levelColors[level]}`} />
            <p className="text-xs font-medium text-foreground">{dist[level] ?? 0}</p>
            <p className="text-[9px] text-muted-foreground">{levelLabels[level]}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {stats.avg_lucidity_level >= 2
          ? "Your lucid control is improving over time."
          : "Keep practicing to increase your dream control."}
      </p>
    </div>
  );
};

export default LucidityTrendCard;

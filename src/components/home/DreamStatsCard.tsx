import React, { useMemo } from "react";
import { useLucidStats } from "@/hooks/useLucidStats";
import { ResponsiveContainer, LineChart, Line } from "recharts";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * "Dream Stats" card for Home: current recall streak + a 7-day mini sparkline,
 * with a crescent glow motif. Uses useLucidStats (which falls back to demo data
 * when the account is empty, so it always looks alive).
 */
const DreamStatsCard: React.FC = () => {
  const { stats } = useLucidStats();
  const streak = stats?.current_recall_streak ?? 0;

  const last7 = useMemo(() => {
    const chart = stats?.recall_chart ?? [];
    const pts = chart.slice(-7);
    return pts.map((p, i) => {
      let label = DAY_LABELS[i] ?? "";
      if (p.day) {
        const d = new Date(p.day);
        if (!Number.isNaN(d.getTime())) label = DAY_LABELS[d.getDay()];
      }
      return { label, count: p.count ?? p.total_count ?? 0 };
    });
  }, [stats]);

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-4 lg:p-6">
      {/* Crescent glow motif */}
      <div className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.45),transparent_65%)] blur-md" />
      <div className="pointer-events-none absolute right-4 top-4 h-16 w-16 rounded-full border border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.4)]" />

      <p className="text-[11px] lg:text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Dream Streak
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl lg:text-4xl font-black text-foreground">{streak}</span>
        <span className="text-sm lg:text-base text-muted-foreground">
          {streak === 1 ? "day" : "days"}
        </span>
      </div>
      <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">Keep going, dreamer.</p>

      {/* Mini sparkline */}
      <div className="mt-4 h-12 lg:h-14">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last7} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex justify-between px-1">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground/60">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DreamStatsCard;

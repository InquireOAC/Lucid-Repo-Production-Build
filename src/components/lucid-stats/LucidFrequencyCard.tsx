import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { LucidStatsData, TimeRange } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
}

const ranges: TimeRange[] = ["7d", "30d", "90d", "all"];

const LucidFrequencyCard: React.FC<Props> = ({ stats, timeRange, onTimeRangeChange }) => {
  if (!stats || stats.total_entries === 0) return null;

  const chartData = stats.lucid_chart.map((p) => ({
    name: p.week ? new Date(p.week).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "",
    lucid: p.lucid_count ?? 0,
    total: p.total_count ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Lucid Frequency</h2>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                timeRange === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Total Lucid" value={stats.total_lucid_dreams} />
        <Stat label="This Month" value={stats.lucid_this_month} />
        <Stat label="Current Streak" value={`${stats.current_lucid_streak}d`} />
        <Stat label="Best Streak" value={`${stats.longest_lucid_streak}d`} />
      </div>

      {chartData.length > 1 ? (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="total" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.25} name="Total" />
              <Bar dataKey="lucid" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.9} name="Lucid" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">Log more dreams to see trends.</p>
      )}

      {stats.days_since_last_lucid != null && stats.days_since_last_lucid > 0 && (
        <p className="text-xs text-muted-foreground">
          {stats.days_since_last_lucid === 1
            ? "Your last lucid dream was yesterday."
            : `${stats.days_since_last_lucid} days since your last lucid dream.`}
        </p>
      )}
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-0.5">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default LucidFrequencyCard;

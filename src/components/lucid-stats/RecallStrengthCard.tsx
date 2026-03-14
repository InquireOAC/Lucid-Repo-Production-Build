import React from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
}

const RecallStrengthCard: React.FC<Props> = ({ stats }) => {
  if (!stats || stats.total_entries === 0) return null;

  const chartData = stats.recall_chart.map((p) => ({
    name: p.day ? new Date(p.day).toLocaleDateString(undefined, { day: "numeric" }) : "",
    count: p.count ?? 0,
  }));

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-foreground">Dream Recall</h2>

      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Streak" value={`${stats.current_recall_streak}d`} />
        <Stat label="Best" value={`${stats.longest_recall_streak}d`} />
        <Stat label="Avg/Night" value={stats.avg_dreams_per_night} />
        <Stat label="Avg Words" value={stats.avg_word_count} />
      </div>

      {chartData.length > 1 && (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {stats.total_nights} nights logged across {stats.total_entries} entries.
      </p>
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

export default RecallStrengthCard;

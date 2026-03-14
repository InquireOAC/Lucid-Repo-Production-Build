import React from "react";
import { Sparkles } from "lucide-react";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
}

const AICoachCard: React.FC<Props> = ({ stats }) => {
  const insight = stats?.latest_insight;

  return (
    <div className="rounded-2xl px-5 py-6 space-y-3 bg-gradient-to-br from-primary/12 via-accent/8 to-transparent border border-primary/10">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">AI Dream Coach</h2>
      </div>

      {insight?.summary_message ? (
        <div className="space-y-2.5">
          <p className="text-sm text-foreground leading-relaxed">{insight.summary_message}</p>
          {insight.recommendation_message && (
            <p className="text-sm text-muted-foreground italic leading-relaxed">{insight.recommendation_message}</p>
          )}
          {insight.motivation_message && (
            <p className="text-xs text-primary/80 font-medium">{insight.motivation_message}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Updated {new Date(insight.generated_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stats && stats.total_entries >= 5
              ? "Your AI coaching insight will be generated soon based on your dream patterns."
              : "Log at least 5 dreams to unlock personalized AI coaching insights."}
          </p>
          <p className="text-xs text-primary/60 leading-relaxed">
            The AI coach analyzes your lucid frequency, technique success rates, and recurring dream signs to give actionable advice.
          </p>
        </div>
      )}
    </div>
  );
};

export default AICoachCard;

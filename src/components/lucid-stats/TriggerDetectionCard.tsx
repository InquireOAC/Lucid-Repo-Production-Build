import React from "react";
import { Badge } from "@/components/ui/badge";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
}

const TriggerDetectionCard: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;

  const symbols = stats.top_symbols.slice(0, 8);

  if (symbols.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Dream Triggers</h2>
        <p className="text-sm text-muted-foreground">Add tags to your dreams to discover recurring triggers and symbols.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Dream Triggers</h2>

      <div className="flex flex-wrap gap-2">
        {symbols.map((s) => (
          <Badge
            key={s.symbol}
            variant="outline"
            className="text-xs bg-primary/10 border-primary/20 text-foreground px-3 py-1"
          >
            {s.symbol}
            <span className="ml-1.5 text-muted-foreground font-normal">×{s.count}</span>
          </Badge>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        These symbols appear often in your dreams. Use them as reality-check cues in waking life.
      </p>
    </div>
  );
};

export default TriggerDetectionCard;

import React from "react";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface Props {
  stats: LucidStatsData | null;
}

const TechniqueEffectivenessCard: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;
  
  const techniques = stats.techniques.filter((t) => t.technique !== "None");

  if (techniques.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Technique Effectiveness</h2>
        <p className="text-sm text-muted-foreground">
          Try recording the techniques you use before sleep to see what works best for you.
        </p>
      </div>
    );
  }

  const maxRate = Math.max(...techniques.map((t) => t.rate), 1);
  const best = techniques[0];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Technique Effectiveness</h2>

      {best && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-primary font-medium">⚡ Most Effective:</span>
          <span className="text-foreground font-semibold">{best.technique}</span>
          <span className="text-muted-foreground">({best.rate}%)</span>
        </div>
      )}

      <div className="space-y-3">
        {techniques.map((t) => (
          <div key={t.technique} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-medium">{t.technique}</span>
              <span className="text-muted-foreground">{t.rate}% · {t.uses} uses</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${(t.rate / maxRate) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">Based on your logged pre-sleep techniques.</p>
    </div>
  );
};

export default TechniqueEffectivenessCard;

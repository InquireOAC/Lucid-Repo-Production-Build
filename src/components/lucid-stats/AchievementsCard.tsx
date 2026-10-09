import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LucidStatsData } from "@/hooks/useLucidStats";

interface AchievementDef {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

interface Props {
  stats: LucidStatsData | null;
}

const AchievementsCard: React.FC<Props> = ({ stats }) => {
  const [allDefs, setAllDefs] = useState<AchievementDef[]>([]);

  useEffect(() => {
    supabase
      .from("lucid_achievement_definitions")
      .select("id, key, title, description, icon, category")
      .then(({ data }) => {
        if (data) setAllDefs(data as AchievementDef[]);
      });
  }, []);

  if (allDefs.length === 0) return null;

  const unlockedKeys = new Set(stats?.achievements.map((a) => a.key) ?? []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Achievements</h2>
        <span className="text-xs text-muted-foreground">
          {unlockedKeys.size}/{allDefs.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {allDefs.map((def) => {
          const unlocked = unlockedKeys.has(def.key);
          return (
            <div
              key={def.key}
              className={`flex-shrink-0 w-20 text-center space-y-1.5 p-2.5 rounded-xl transition-all ${
                unlocked
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/10 border border-border/30 opacity-40"
              }`}
            >
              <div className="text-2xl">{def.icon}</div>
              <p className="text-[10px] font-medium text-foreground leading-tight">{def.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsCard;

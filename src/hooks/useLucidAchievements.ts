import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { LucidStatsData } from "./useLucidStats";

interface AchievementDef {
  id: string;
  key: string;
  title: string;
  icon: string;
  unlock_rule: { type: string; value: number };
}

export function useLucidAchievements(stats: LucidStatsData | null) {
  const { user } = useAuth();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || !stats || checkedRef.current) return;
    checkedRef.current = true;

    (async () => {
      try {
        const { data: defs } = await supabase
          .from("lucid_achievement_definitions")
          .select("id, key, title, icon, unlock_rule");
        if (!defs?.length) return;

        const unlockedKeys = new Set(stats.achievements.map((a) => a.key));

        const techniquesCount = stats.techniques.length;
        const hasFullControl = Object.keys(stats.level_distribution).includes("3");

        for (const def of defs as AchievementDef[]) {
          if (unlockedKeys.has(def.key)) continue;

          const rule = def.unlock_rule;
          let met = false;

          switch (rule.type) {
            case "total_lucid":
              met = stats.total_lucid_dreams >= rule.value;
              break;
            case "recall_streak":
              met = stats.longest_recall_streak >= rule.value;
              break;
            case "lucidity_level":
              met = hasFullControl;
              break;
            case "techniques_tried":
              met = techniquesCount >= rule.value;
              break;
            case "total_entries":
              met = stats.total_entries >= rule.value;
              break;
          }

          if (met) {
            const { error } = await supabase
              .from("lucid_user_achievements")
              .insert({ user_id: user.id, achievement_id: def.id })
              .select()
              .single();

            if (!error) {
              toast.success(`🏆 Achievement Unlocked: ${def.title}`, {
                description: `${def.icon} ${def.key}`,
                duration: 5000,
              });
            }
          }
        }
      } catch (e) {
        console.error("Achievement check error:", e);
      }
    })();
  }, [user?.id, stats]);
}

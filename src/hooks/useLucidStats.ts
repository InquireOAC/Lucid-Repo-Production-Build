import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export interface TechniqueStats {
  technique: string;
  uses: number;
  successes: number;
  rate: number;
}

export interface SymbolStats {
  symbol: string;
  count: number;
}

export interface ChartPoint {
  week?: string;
  day?: string;
  lucid_count?: number;
  total_count?: number;
  count?: number;
}

export interface AchievementData {
  achievement_id: string;
  unlocked_at: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface InsightData {
  summary_message: string | null;
  recommendation_message: string | null;
  motivation_message: string | null;
  generated_at: string;
}

export interface LucidStatsData {
  total_lucid_dreams: number;
  lucid_this_month: number;
  current_lucid_streak: number;
  longest_lucid_streak: number;
  days_since_last_lucid: number | null;
  total_entries: number;
  total_nights: number;
  current_recall_streak: number;
  longest_recall_streak: number;
  avg_dreams_per_night: number;
  avg_word_count: number;
  techniques: TechniqueStats[];
  top_symbols: SymbolStats[];
  avg_lucidity_level: number;
  level_distribution: Record<string, number>;
  lucid_chart: ChartPoint[];
  recall_chart: ChartPoint[];
  latest_insight: InsightData | null;
  achievements: AchievementData[];
}

export type TimeRange = "7d" | "30d" | "90d" | "all";

export function useLucidStats() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lucid-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc("get_lucid_stats", {
        p_user_id: user.id,
      });
      if (error) throw error;
      const result = data as unknown as LucidStatsData;

      // If the RPC returned empty/zeroed data, inject mock data for demo
      if (!result || result.total_entries === 0) {
        return generateMockStats();
      }

      return result;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    refetch,
    timeRange,
    setTimeRange,
  };
}

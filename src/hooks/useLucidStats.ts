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

function generateMockStats(): LucidStatsData {
  const now = new Date();
  const lucidChart: ChartPoint[] = [];
  const recallChart: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    lucidChart.push({ day: dayStr, count: Math.random() > 0.65 ? Math.floor(Math.random() * 2) + 1 : 0 });
    recallChart.push({ day: dayStr, count: Math.floor(Math.random() * 3) + 1 });
  }
  return {
    total_lucid_dreams: 23,
    lucid_this_month: 7,
    current_lucid_streak: 3,
    longest_lucid_streak: 8,
    days_since_last_lucid: 1,
    total_entries: 94,
    total_nights: 82,
    current_recall_streak: 12,
    longest_recall_streak: 21,
    avg_dreams_per_night: 1.4,
    avg_word_count: 187,
    techniques: [
      { technique: "WILD", uses: 28, successes: 14, rate: 50 },
      { technique: "MILD", uses: 35, successes: 12, rate: 34 },
      { technique: "WBTB", uses: 18, successes: 9, rate: 50 },
      { technique: "Reality Check", uses: 42, successes: 8, rate: 19 },
      { technique: "SSILD", uses: 11, successes: 4, rate: 36 },
    ],
    top_symbols: [
      { symbol: "Water", count: 18 },
      { symbol: "Flying", count: 14 },
      { symbol: "Chase", count: 11 },
      { symbol: "Falling", count: 9 },
      { symbol: "Mirror", count: 7 },
    ],
    avg_lucidity_level: 2.1,
    level_distribution: { "1": 8, "2": 10, "3": 5 },
    lucid_chart: lucidChart,
    recall_chart: recallChart,
    latest_insight: {
      summary_message: "You've been on a strong streak! Your WILD technique is showing the best results this month.",
      recommendation_message: "Try combining WBTB with WILD for even higher success rates.",
      motivation_message: "You're in the top tier of lucid dreamers — keep the momentum going!",
      generated_at: now.toISOString(),
    },
    achievements: [
      { achievement_id: "a1", unlocked_at: new Date(now.getTime() - 86400000 * 5).toISOString(), key: "first_lucid", title: "First Lucid Dream", description: "Achieved your first lucid dream", icon: "🌟", category: "milestone" },
      { achievement_id: "a2", unlocked_at: new Date(now.getTime() - 86400000 * 12).toISOString(), key: "week_streak", title: "7-Day Streak", description: "Logged dreams 7 days in a row", icon: "🔥", category: "streak" },
      { achievement_id: "a3", unlocked_at: new Date(now.getTime() - 86400000 * 2).toISOString(), key: "dream_master", title: "Dream Master", description: "Reached 20 lucid dreams", icon: "👑", category: "milestone" },
    ],
  };
}

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

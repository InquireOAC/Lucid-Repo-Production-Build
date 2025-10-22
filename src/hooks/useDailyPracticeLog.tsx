import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyPracticeEntry {
  id: string;
  user_id: string;
  practice_type_id: string;
  path_id?: string;
  level_id?: string;
  duration_minutes?: number;
  xp_earned: number;
  notes?: string;
  completed_at: string;
  created_at: string;
}

export const useDailyPracticeLog = (date?: Date) => {
  const { user } = useAuth();

  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0];

  const { data: practices, isLoading } = useQuery({
    queryKey: ["daily-practice-log", user?.id, dateString],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("daily_practice_log")
        .select(`
          *,
          practice_types (
            name,
            display_name,
            xp_reward,
            category
          )
        `)
        .eq("user_id", user.id)
        .gte("completed_at", `${dateString}T00:00:00`)
        .lt("completed_at", `${dateString}T23:59:59`)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as DailyPracticeEntry[];
    },
    enabled: !!user,
  });

  const getTotalXP = () => {
    return practices?.reduce((sum, p) => sum + p.xp_earned, 0) ?? 0;
  };

  const getPracticeCount = () => {
    return practices?.length ?? 0;
  };

  const getPracticesByCategory = () => {
    const categorized: Record<string, DailyPracticeEntry[]> = {};
    practices?.forEach((practice) => {
      const category = (practice as any).practice_types?.category || "other";
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(practice);
    });
    return categorized;
  };

  return {
    practices,
    isLoading,
    getTotalXP,
    getPracticeCount,
    getPracticesByCategory,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LogPracticeParams {
  practiceTypeId: string;
  pathId?: string;
  levelId?: string;
  durationMinutes?: number;
  xpEarned: number;
  notes?: string;
}

export const usePracticeLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logPractice = useMutation({
    mutationFn: async (params: LogPracticeParams) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("daily_practice_log")
        .insert({
          user_id: user.id,
          practice_type_id: params.practiceTypeId,
          path_id: params.pathId,
          level_id: params.levelId,
          duration_minutes: params.durationMinutes,
          xp_earned: params.xpEarned,
          notes: params.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update learning_progress streak and XP
      await supabase.rpc("update_learning_streak_and_xp", {
        p_user_id: user.id,
        p_xp_to_add: params.xpEarned,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`+${variables.xpEarned} XP earned! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["learning-progress"] });
      queryClient.invalidateQueries({ queryKey: ["path-progress"] });
    },
  });

  return { logPractice };
};

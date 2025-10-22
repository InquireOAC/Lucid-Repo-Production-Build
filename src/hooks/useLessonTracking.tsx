import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LessonCompletion {
  id: string;
  user_id: string;
  level_id: string;
  lesson_type: string;
  lesson_id: string;
  completed_at: string;
}

export const useLessonTracking = (levelId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: completions, isLoading } = useQuery({
    queryKey: ["lesson-completions", user?.id, levelId],
    queryFn: async () => {
      if (!user || !levelId) return [];

      const { data, error } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("level_id", levelId);

      if (error) throw error;
      return data as LessonCompletion[];
    },
    enabled: !!user && !!levelId,
  });

  const markLessonComplete = useMutation({
    mutationFn: async ({
      levelId,
      lessonType,
      lessonId,
    }: {
      levelId: string;
      lessonType: string;
      lessonId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("lesson_completions")
        .insert({
          user_id: user.id,
          level_id: levelId,
          lesson_type: lessonType,
          lesson_id: lessonId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-completions"] });
    },
  });

  const isLessonComplete = (lessonId: string) => {
    return completions?.some((c) => c.lesson_id === lessonId) ?? false;
  };

  const getLevelProgress = () => {
    if (!completions) return 0;
    return completions.length;
  };

  return {
    completions,
    isLoading,
    markLessonComplete,
    isLessonComplete,
    getLevelProgress,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LessonCard {
  title: string;
  body: string;
  illustration_url?: string;
}

export interface PracticeTask {
  task: string;
  reminder_interval_minutes?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

export interface AcademyLesson {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  cards: LessonCard[];
  practice_tasks: PracticeTask[];
  quiz_questions: QuizQuestion[];
  technique_markers: string[] | null;
  xp_reward: number;
}

export interface LessonProgress {
  id: string;
  status: string;
  cards_viewed: number;
  practice_completed: boolean;
  dream_logged: boolean;
  quiz_score: number | null;
  quiz_passed: boolean;
  xp_awarded: number;
}

export function useAcademyLessons(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['academy-lessons', moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      const { data, error } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('lesson_number');
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        cards: (d.cards as any) || [],
        practice_tasks: (d.practice_tasks as any) || [],
        quiz_questions: (d.quiz_questions as any) || [],
        technique_markers: (d.technique_markers as any) || null,
      })) as AcademyLesson[];
    },
    enabled: !!moduleId,
  });
}

export function useAcademyLessonProgress(moduleId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['academy-lesson-progress', moduleId, user?.id],
    queryFn: async () => {
      if (!user || !moduleId) return [];
      const { data, error } = await supabase
        .from('academy_user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!moduleId,
  });
}

export function useUpdateLessonProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      lessonId: string;
      moduleId: string;
      updates: Record<string, any>;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('academy_user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: params.lessonId,
          module_id: params.moduleId,
          ...params.updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['academy-lesson-progress', params.moduleId] });
      queryClient.invalidateQueries({ queryKey: ['academy-modules'] });
    },
  });
}

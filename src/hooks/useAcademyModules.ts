import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AcademyModule {
  id: string;
  title: string;
  description: string | null;
  track: string;
  tier_required: number;
  prerequisite_module_id: string | null;
  lesson_count: number;
  icon: string | null;
  sort_order: number;
}

export interface ModuleWithProgress extends AcademyModule {
  lessons_completed: number;
  is_unlocked: boolean;
  is_completed: boolean;
}

export function useAcademyModules() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['academy-modules', user?.id],
    queryFn: async () => {
      const { data: modules, error } = await supabase
        .from('academy_modules')
        .select('*')
        .order('sort_order');
      if (error) throw error;

      if (!user) {
        return (modules as AcademyModule[]).map(m => ({
          ...m,
          lessons_completed: 0,
          is_unlocked: m.tier_required === 1 && !m.prerequisite_module_id,
          is_completed: false,
        })) as ModuleWithProgress[];
      }

      const { data: moduleProgress } = await supabase
        .from('academy_user_module_progress')
        .select('*')
        .eq('user_id', user.id);

      const progressMap = new Map((moduleProgress || []).map(p => [p.module_id, p]));
      const completedModules = new Set(
        (moduleProgress || []).filter(p => p.is_completed).map(p => p.module_id)
      );

      // Get user tier
      const { data: userProgress } = await supabase
        .from('academy_user_progress')
        .select('current_tier')
        .eq('user_id', user.id)
        .maybeSingle();
      const userTier = userProgress?.current_tier || 1;

      return (modules as AcademyModule[]).map(m => {
        const mp = progressMap.get(m.id);
        const prereqMet = !m.prerequisite_module_id || completedModules.has(m.prerequisite_module_id);
        const tierMet = userTier >= m.tier_required;
        return {
          ...m,
          lessons_completed: mp?.lessons_completed || 0,
          is_unlocked: tierMet && prereqMet,
          is_completed: mp?.is_completed || false,
        };
      }) as ModuleWithProgress[];
    },
  });
}

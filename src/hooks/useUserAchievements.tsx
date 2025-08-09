import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  learning_achievements?: Achievement;
}

export const useUserAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user's unlocked achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          learning_achievements (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (userError) throw userError;

      // Fetch all available achievements
      const { data: allAchievementsData, error: allError } = await supabase
        .from('learning_achievements')
        .select('*')
        .order('xp_reward');

      if (allError) throw allError;

      setAchievements(userAchievements || []);
      setAllAchievements(allAchievementsData || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!userId) return;

    try {
      // Check if already unlocked
      const existingAchievement = achievements.find(a => a.achievement_id === achievementId);
      if (existingAchievement) {
        return false; // Already unlocked
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        })
        .select(`
          *,
          learning_achievements (*)
        `)
        .single();

      if (error) throw error;

      setAchievements(prev => [data, ...prev]);
      
      // Show toast notification
      const achievement = data.learning_achievements;
      if (achievement) {
        toast.success(`Achievement Unlocked! ${achievement.icon} ${achievement.name}`, {
          duration: 5000,
        });
      }

      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  };

  const checkAchievements = async (stats: {
    sessions_completed?: number;
    dreams_logged?: number;
    reality_checks?: number;
    meditation_sessions?: number;
    streak_days?: number;
    level_reached?: number;
    audio_sessions?: number;
    total_practice_days?: number;
  }) => {
    if (!userId || allAchievements.length === 0) return;

    const unlockedAchievementIds = achievements.map(a => a.achievement_id);
    
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.includes(achievement.id)) continue;

      // Check if requirement is met
      const statValue = stats[achievement.requirement_type as keyof typeof stats] || 0;
      if (statValue >= achievement.requirement_value) {
        await unlockAchievement(achievement.id);
      }
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  return {
    achievements,
    allAchievements,
    loading,
    unlockAchievement,
    checkAchievements,
    refetch: fetchAchievements
  };
};
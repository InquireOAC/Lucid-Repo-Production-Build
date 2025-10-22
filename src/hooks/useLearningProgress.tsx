import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearningProgress {
  id: string;
  user_id: string;
  current_level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  last_practice_date?: string;
  dream_recall_level: number;
  lucid_dreaming_level: number;
  obe_level: number;
  meditation_level: number;
  dream_recall_xp: number;
  lucid_dreaming_xp: number;
  obe_xp: number;
  meditation_xp: number;
  created_at: string;
  updated_at: string;
}

export const useLearningProgress = (userId?: string) => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create initial progress for new user
        const { data: newProgress, error: createError } = await supabase
          .from('learning_progress')
          .insert({
            user_id: userId,
            current_level: 1,
            total_xp: 0,
            current_streak: 0,
            longest_streak: 0,
            dream_recall_level: 1,
            lucid_dreaming_level: 1,
            obe_level: 1,
            meditation_level: 1,
            dream_recall_xp: 0,
            lucid_dreaming_xp: 0,
            obe_xp: 0,
            meditation_xp: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        setProgress(newProgress);
      } else {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      toast.error('Failed to load learning progress');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<LearningProgress>) => {
    if (!userId || !progress) return;

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error updating learning progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const addXP = async (xpAmount: number) => {
    if (!progress) return;

    const newXP = progress.total_xp + xpAmount;
    const currentLevel = calculateLevel(newXP);
    
    await updateProgress({
      total_xp: newXP,
      current_level: Math.max(currentLevel, progress.current_level),
      last_activity_date: new Date().toISOString().split('T')[0]
    });

    // Check for level up
    if (currentLevel > progress.current_level) {
      toast.success(`Level up! You reached Level ${currentLevel}!`, {
        duration: 5000,
      });
    }
  };

  const updateStreak = async () => {
    if (!progress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progress.last_activity_date;
    
    let newStreak = 1;
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = progress.current_streak + 1;
      } else if (daysDiff === 0) {
        // Same day, no change
        return;
      }
      // If daysDiff > 1, streak breaks and resets to 1
    }

    const newLongestStreak = Math.max(newStreak, progress.longest_streak);

    await updateProgress({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today
    });

    if (newStreak > progress.current_streak) {
      toast.success(`🔥 ${newStreak} day streak!`);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  return {
    progress,
    loading,
    addXP,
    updateStreak,
    updateProgress,
    refetch: fetchProgress
  };
};

// Helper function to calculate level based on XP
const calculateLevel = (xp: number): number => {
  const levelThresholds = [0, 0, 100, 250, 450, 700, 1000, 1400];
  
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (xp >= levelThresholds[i]) {
      return i;
    }
  }
  return 1;
};
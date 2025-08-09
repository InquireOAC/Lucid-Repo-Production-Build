import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PracticeSession {
  id: string;
  user_id: string;
  session_type: string;
  level_id?: string;
  duration_minutes?: number;
  xp_earned: number;
  completed_at: string;
}

interface CreateSessionParams {
  user_id: string;
  session_type: string;
  level_id?: string;
  duration_minutes?: number;
  xp_earned: number;
}

export const usePracticeSessions = (userId?: string) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50); // Get last 50 sessions

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching practice sessions:', error);
      toast.error('Failed to load practice sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: CreateSessionParams) => {
    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setSessions(prev => [data, ...prev]);

      // Show success message
      toast.success(`Practice completed! +${sessionData.xp_earned} XP`, {
        duration: 3000,
      });

      return data;
    } catch (error) {
      console.error('Error creating practice session:', error);
      toast.error('Failed to save practice session');
      return null;
    }
  };

  const getSessionStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const stats = {
      total_sessions: sessions.length,
      today_sessions: sessions.filter(s => 
        s.completed_at.split('T')[0] === today
      ).length,
      week_sessions: sessions.filter(s => 
        new Date(s.completed_at) >= thisWeek
      ).length,
      total_xp: sessions.reduce((sum, s) => sum + s.xp_earned, 0),
      session_types: sessions.reduce((acc, s) => {
        acc[s.session_type] = (acc[s.session_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return stats;
  };

  const getStreakData = () => {
    if (sessions.length === 0) return { current: 0, longest: 0 };

    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    // Get unique dates
    const uniqueDates = [...new Set(sortedSessions.map(s => 
      s.completed_at.split('T')[0]
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length === 0) return { current: 0, longest: 0 };

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      const daysDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  return {
    sessions,
    loading,
    createSession,
    getSessionStats,
    getStreakData,
    refetch: fetchSessions
  };
};
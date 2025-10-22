import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { usePathProgress } from '@/hooks/usePathProgress';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { PathCard } from '@/components/learning/PathCard';
import { RecommendedNextStep } from '@/components/learning/RecommendedNextStep';
import { StreakCounter } from '@/components/learning/StreakCounter';
import { DailyPracticeChecklist } from '@/components/learning/DailyPracticeChecklist';

const Learn = () => {
  const { user, loading } = useAuth();
  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const { progress: pathProgress } = usePathProgress();
  const { progress: learningProgress } = useLearningProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground">Please sign in to access the learning system.</p>
        </div>
      </div>
    );
  }

  if (pathsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-safe-top pl-safe-left pr-safe-right px-4 py-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">🎯 My Learning Journey</h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-primary font-semibold">XP: {learningProgress?.total_xp || 0}</span>
            <span className="text-muted-foreground">Level {learningProgress?.current_level || 1}</span>
          </div>
        </div>

        <StreakCounter 
          currentStreak={learningProgress?.current_streak || 0}
          longestStreak={learningProgress?.longest_streak || 0}
        />

        <RecommendedNextStep
          pathTitle="Dream Recall Mastery"
          levelTitle="Dream Journal Foundation"
          onClick={() => {}}
        />

        <div>
          <h2 className="text-2xl font-semibold mb-4">📊 My Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paths?.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                progress={pathProgress?.find((p) => p.path_id === path.id)}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
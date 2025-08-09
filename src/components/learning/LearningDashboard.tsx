import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, Brain } from 'lucide-react';
import { LevelGrid } from './LevelGrid';
import { AchievementBadge } from './AchievementBadge';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { useNotificationManager } from '@/hooks/useNotificationManager';

interface LearningDashboardProps {
  userId?: string;
}

export const LearningDashboard = ({ userId }: LearningDashboardProps) => {
  const { progress, loading: progressLoading } = useLearningProgress(userId);
  const { achievements, loading: achievementsLoading } = useUserAchievements(userId);
  const { initializeNotifications } = useNotificationManager();

  useEffect(() => {
    // Initialize notifications for mobile app
    initializeNotifications();
  }, [initializeNotifications]);

  if (progressLoading || achievementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentXP = progress?.total_xp || 0;
  const currentLevel = progress?.current_level || 1;
  const currentStreak = progress?.current_streak || 0;
  const longestStreak = progress?.longest_streak || 0;

  // Calculate XP needed for next level
  const xpForNextLevel = currentLevel === 7 ? 0 : getXPRequiredForLevel(currentLevel + 1);
  const xpForCurrentLevel = getXPRequiredForLevel(currentLevel);
  const progressToNext = xpForNextLevel > 0 ? 
    ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100 : 100;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Lucid Learning</h1>
        <p className="text-muted-foreground">Master the art of lucid dreaming</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">Level {currentLevel}</span>
                <Badge variant="secondary">{currentXP} XP</Badge>
              </div>
              {currentLevel < 7 && (
                <div className="space-y-1">
                  <Progress value={Math.min(progressToNext, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {xpForNextLevel - currentXP} XP to Level {currentLevel + 1}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Practice Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{currentStreak}</span>
                <Badge variant="outline">Current</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Longest: {longestStreak} days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{achievements.length}</span>
                <Badge variant="outline">Unlocked</Badge>
              </div>
              <div className="flex gap-1">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="text-sm">
                    {achievement.learning_achievements?.icon}
                  </div>
                ))}
                {achievements.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{achievements.length - 3}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {achievements.slice(0, 5).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement.learning_achievements!}
                  unlocked={true}
                  unlockedAt={achievement.unlocked_at}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Levels Grid */}
      <LevelGrid currentLevel={currentLevel} userId={userId} />
    </div>
  );
};

// Helper function to get XP required for a specific level
const getXPRequiredForLevel = (level: number): number => {
  const requirements = [0, 0, 100, 250, 450, 700, 1000, 1400];
  return requirements[level] || 0;
};
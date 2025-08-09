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
    <div className="min-h-screen dream-background">
      <div className="container mx-auto px-4 pt-6 pb-20 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              Lucid Learning
            </h1>
            <Brain className="absolute -top-1 -right-8 h-8 w-8 text-primary/40 animate-float hidden sm:block" />
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Master the art of lucid dreaming through guided practices
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Level Progress Card */}
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <Brain className="h-5 w-5" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground">Level {currentLevel}</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {currentXP} XP
                  </Badge>
                </div>
                {currentLevel < 7 && (
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(progressToNext, 100)} 
                      className="h-2 bg-primary/10"
                    />
                    <p className="text-xs text-muted-foreground">
                      {xpForNextLevel - currentXP} XP to Level {currentLevel + 1}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Practice Streak Card */}
          <Card className="relative overflow-hidden border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-accent">
                <Flame className="h-5 w-5" />
                Practice Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    Days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Personal best: {longestStreak} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="relative overflow-hidden border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-yellow-400/5 to-transparent backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-400">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground">{achievements.length}</span>
                  <Badge variant="outline" className="border-yellow-400/30 text-yellow-400">
                    Unlocked
                  </Badge>
                </div>
                <div className="flex gap-1 items-center">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="text-lg animate-float" style={{animationDelay: `${Math.random() * 2}s`}}>
                      {achievement.learning_achievements?.icon}
                    </div>
                  ))}
                  {achievements.length > 3 && (
                    <span className="text-xs text-muted-foreground ml-1">+{achievements.length - 3} more</span>
                  )}
                  {achievements.length === 0 && (
                    <span className="text-xs text-muted-foreground">Start practicing to unlock</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/60 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="h-6 w-6 text-yellow-400" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                {achievements.slice(0, 5).map((achievement, index) => (
                  <div key={achievement.id} className="flex-shrink-0" style={{animationDelay: `${index * 0.1}s`}}>
                    <AchievementBadge
                      achievement={achievement.learning_achievements!}
                      unlocked={true}
                      unlockedAt={achievement.unlocked_at}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Levels Grid */}
        <LevelGrid currentLevel={currentLevel} userId={userId} />
      </div>
    </div>
  );
};

// Helper function to get XP required for a specific level
const getXPRequiredForLevel = (level: number): number => {
  const requirements = [0, 0, 100, 250, 450, 700, 1000, 1400];
  return requirements[level] || 0;
};
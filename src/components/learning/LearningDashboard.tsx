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
    <div className="min-h-screen starry-background overflow-hidden">
      <div className="container mx-auto px-4 pt-8 pb-20 space-y-12 max-w-7xl">
        {/* Oniri-style Header */}
        <div className="text-center space-y-6 pt-8">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4">
              Lucid Learning
            </h1>
            <div className="absolute -top-2 -right-12 hidden sm:block">
              <Brain className="h-12 w-12 text-purple-400/30 animate-float" />
            </div>
            <div className="absolute -bottom-4 -left-8 hidden sm:block">
              <Star className="h-8 w-8 text-pink-400/40 animate-float" style={{animationDelay: '1s'}} />
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-foreground/80 leading-relaxed">
              Embark on a journey to master lucid dreaming through structured practices and personalized guidance
            </p>
          </div>
        </div>

        {/* Oniri-style Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level Progress Card */}
          <Card className="glass-card oniri-hover border-white/10">
            <div className="geometric-bg absolute inset-0 rounded-lg opacity-50"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-3 text-purple-300">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <Brain className="h-5 w-5" />
                </div>
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-white">Level {currentLevel}</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-1">
                    {currentXP} XP
                  </Badge>
                </div>
                {currentLevel < 7 && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Progress 
                        value={Math.min(progressToNext, 100)} 
                        className="h-3 bg-white/10 rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-80" 
                           style={{width: `${Math.min(progressToNext, 100)}%`}}></div>
                    </div>
                    <p className="text-sm text-white/70">
                      {xpForNextLevel - currentXP} XP to Level {currentLevel + 1}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Practice Streak Card */}
          <Card className="glass-card oniri-hover border-white/10">
            <div className="geometric-bg absolute inset-0 rounded-lg opacity-30"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-3 text-orange-300">
                <div className="p-2 rounded-full bg-orange-500/20">
                  <Flame className="h-5 w-5" />
                </div>
                Practice Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-white">{currentStreak}</span>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 px-3 py-1">
                    Days
                  </Badge>
                </div>
                <p className="text-sm text-white/70">
                  Personal best: {longestStreak} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="glass-card oniri-hover border-white/10">
            <div className="geometric-bg absolute inset-0 rounded-lg opacity-40"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-3 text-yellow-300">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <Trophy className="h-5 w-5" />
                </div>
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-white">{achievements.length}</span>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 px-3 py-1">
                    Unlocked
                  </Badge>
                </div>
                <div className="flex gap-2 items-center">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="text-2xl animate-float p-1 rounded bg-white/10" style={{animationDelay: `${Math.random() * 2}s`}}>
                      {achievement.learning_achievements?.icon}
                    </div>
                  ))}
                  {achievements.length > 3 && (
                    <span className="text-sm text-white/70 ml-2">+{achievements.length - 3} more</span>
                  )}
                  {achievements.length === 0 && (
                    <span className="text-sm text-white/70">Start practicing to unlock</span>
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
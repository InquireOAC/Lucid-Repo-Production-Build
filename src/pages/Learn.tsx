import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { usePathProgress } from '@/hooks/usePathProgress';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { usePathLevels } from '@/hooks/usePathLevels';
import { PathCard } from '@/components/learning/PathCard';
import { RecommendedNextStep } from '@/components/learning/RecommendedNextStep';
import { StreakCounter } from '@/components/learning/StreakCounter';
import { PathDetailView } from '@/components/learning/PathDetailView';
import { LevelContentView } from '@/components/learning/LevelContentView';
import { AchievementNotification } from '@/components/learning/AchievementNotification';
import { PathLevel } from '@/hooks/usePathLevels';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Learn = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const { progress: pathProgress, initializePathProgress } = usePathProgress();
  const { progress: learningProgress } = useLearningProgress(user?.id);
  
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<PathLevel | null>(null);
  const [achievement, setAchievement] = useState<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(true);
  
  const { data: levels } = usePathLevels(selectedPath || undefined);

  const handleCloseComingSoon = () => {
    setShowComingSoon(false);
    navigate('/');
  };
  
  const currentPath = paths?.find(p => p.id === selectedPath);
  const currentPathProgress = pathProgress?.find(p => p.path_id === selectedPath);

  const handlePathClick = async (pathId: string) => {
    // Initialize progress if not exists
    const existingProgress = pathProgress?.find(p => p.path_id === pathId);
    if (!existingProgress) {
      await initializePathProgress.mutateAsync(pathId);
    }
    setSelectedPath(pathId);
  };

  const handleLevelClick = (level: PathLevel) => {
    setSelectedLevel(level);
  };

  const handleBack = () => {
    if (selectedLevel) {
      setSelectedLevel(null);
    } else if (selectedPath) {
      setSelectedPath(null);
    }
  };

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

  // Show level content if selected
  if (selectedLevel && currentPath) {
    return (
      <div className="flex flex-col min-h-screen bg-background pt-safe-top pl-safe-left pr-safe-right px-4 py-8">
        <LevelContentView
          level={selectedLevel}
          pathId={currentPath.id}
          onBack={handleBack}
        />
        <AchievementNotification
          achievement={achievement}
          onClose={() => setAchievement(null)}
        />
      </div>
    );
  }

  // Show path detail if selected
  if (selectedPath && currentPath && levels) {
    return (
      <div className="flex flex-col min-h-screen bg-background pt-safe-top pl-safe-left pr-safe-right px-4 py-8">
        <PathDetailView
          path={currentPath}
          levels={levels}
          progress={currentPathProgress}
          onLevelClick={handleLevelClick}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Main dashboard
  return (
    <>
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">🚧 Coming Soon</DialogTitle>
            <DialogDescription className="text-center pt-4 text-base">
              The Learning System is currently under development. We're building an amazing experience to help you master lucid dreaming!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={handleCloseComingSoon} className="w-full sm:w-auto">
              Go Back Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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

        {pathProgress && pathProgress.length > 0 && (
          <RecommendedNextStep
            pathTitle={paths?.find(p => p.id === pathProgress[0].path_id)?.title || "Dream Recall Mastery"}
            levelTitle={`Level ${pathProgress[0].current_level}`}
            onClick={() => handlePathClick(pathProgress[0].path_id)}
          />
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4">📊 My Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paths?.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                progress={pathProgress?.find((p) => p.path_id === path.id)}
                onClick={() => handlePathClick(path.id)}
              />
            ))}
          </div>
        </div>

        <AchievementNotification
          achievement={achievement}
          onClose={() => setAchievement(null)}
        />
        </div>
      </div>
    </>
  );
};

export default Learn;

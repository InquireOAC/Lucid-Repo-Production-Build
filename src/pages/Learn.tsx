import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { useAcademyModules, ModuleWithProgress } from '@/hooks/useAcademyModules';
import { useAcademyLessons, useAcademyLessonProgress, AcademyLesson } from '@/hooks/useAcademyLesson';
import { useAcademyBadges } from '@/hooks/useAcademyBadges';
import { AcademyHeroCard } from '@/components/academy/AcademyHeroCard';
import { ModuleList } from '@/components/academy/ModuleList';
import { ModuleDetail } from '@/components/academy/ModuleDetail';
import { LessonFlow } from '@/components/academy/LessonFlow';
import { WeeklyChallengeCard } from '@/components/academy/WeeklyChallengeCard';
import { BadgeShowcase } from '@/components/academy/BadgeShowcase';
import PageTransition from '@/components/ui/PageTransition';

const Learn = () => {
  const { user, loading: authLoading } = useAuth();
  const { progress, isLoading: progressLoading, initProgress } = useAcademyProgress();
  const { data: modules, isLoading: modulesLoading } = useAcademyModules();
  const { data: badges } = useAcademyBadges();

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson | null>(null);

  const { data: lessons } = useAcademyLessons(selectedModuleId || undefined);
  const { data: lessonProgress } = useAcademyLessonProgress(selectedModuleId || undefined);

  // Auto-init progress for new users
  useEffect(() => {
    if (user && !progressLoading && !progress) {
      initProgress.mutate();
    }
  }, [user, progressLoading, progress]);

  if (authLoading || progressLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-safe-top">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-safe-top px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground">Please sign in to access the Dream Academy.</p>
        </div>
      </div>
    );
  }

  const selectedModule = modules?.find(m => m.id === selectedModuleId);

  // Lesson flow view
  if (selectedLesson && selectedModuleId) {
    const existingProgress = lessonProgress?.find(p => p.lesson_id === selectedLesson.id);
    return (
      <PageTransition className="min-h-screen bg-background pt-safe-top px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <LessonFlow
            lesson={selectedLesson}
            existingProgress={existingProgress}
            onBack={() => setSelectedLesson(null)}
            onComplete={() => setSelectedLesson(null)}
          />
        </div>
      </PageTransition>
    );
  }

  // Module detail view
  if (selectedModule && lessons) {
    return (
      <PageTransition className="min-h-screen bg-background pt-safe-top px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <ModuleDetail
            module={selectedModule}
            lessons={lessons}
            lessonProgress={lessonProgress || []}
            onBack={() => setSelectedModuleId(null)}
            onLessonClick={(lesson) => setSelectedLesson(lesson)}
          />
        </div>
      </PageTransition>
    );
  }

  // Academy home
  return (
    <PageTransition className="min-h-screen bg-background pt-safe-top px-4 pt-12 pb-24">
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-foreground text-center my-[18px]">
          <GraduationCap size={24} className="text-primary" />
          Dream Academy
        </h1>

        <AcademyHeroCard
          totalXP={progress?.total_xp || 0}
          currentTier={progress?.current_tier || 1}
          currentStreak={progress?.current_streak || 0}
          longestStreak={progress?.longest_streak || 0}
        />

        <WeeklyChallengeCard />

        {badges && <BadgeShowcase badges={badges} />}

        {modules && (
          <ModuleList
            modules={modules}
            onModuleClick={setSelectedModuleId}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Learn;

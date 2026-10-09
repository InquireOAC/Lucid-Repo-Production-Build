import React, { useState } from 'react';
import { AcademyLesson } from '@/hooks/useAcademyLesson';
import { LearnStep } from './LearnStep';
import { PracticeStep } from './PracticeStep';
import { LogStep } from './LogStep';
import { QuizStep } from './QuizStep';
import { LessonComplete } from './LessonComplete';
import { useUpdateLessonProgress } from '@/hooks/useAcademyLesson';
import { useAcademyXP } from '@/hooks/useAcademyXP';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Step = 'learn' | 'practice' | 'log' | 'quiz' | 'complete';

interface LessonFlowProps {
  lesson: AcademyLesson;
  existingProgress: any;
  onBack: () => void;
  onComplete: () => void;
}

export const LessonFlow: React.FC<LessonFlowProps> = ({
  lesson,
  existingProgress,
  onBack,
  onComplete,
}) => {
  const getInitialStep = (): Step => {
    if (!existingProgress || existingProgress.status === 'not_started') return 'learn';
    if (existingProgress.status === 'learning') return 'learn';
    if (existingProgress.status === 'practicing') return 'practice';
    if (existingProgress.status === 'logging') return 'log';
    if (existingProgress.status === 'quizzing') return 'quiz';
    if (existingProgress.status === 'completed') return 'complete';
    return 'learn';
  };

  const [step, setStep] = useState<Step>(getInitialStep());
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [xpResult, setXpResult] = useState<{ finalAmount: number; multiplier: number } | null>(null);

  const updateProgress = useUpdateLessonProgress();
  const { awardXP } = useAcademyXP();

  const steps: Step[] = ['learn', 'practice', 'log', 'quiz'];
  const stepIndex = steps.indexOf(step);

  const handleLearnComplete = async () => {
    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      moduleId: lesson.module_id,
      updates: { status: 'practicing', cards_viewed: lesson.cards.length },
    });
    setStep('practice');
  };

  const handlePracticeComplete = async () => {
    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      moduleId: lesson.module_id,
      updates: { status: 'logging', practice_completed: true },
    });
    setStep('log');
  };

  const handleLogComplete = async () => {
    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      moduleId: lesson.module_id,
      updates: { status: 'quizzing', dream_logged: true },
    });
    setStep('quiz');
  };

  const handleQuizComplete = async (score: number, total: number) => {
    const passed = score / total >= 0.8;
    setQuizResult({ score, total, passed });

    const alreadyAwarded = existingProgress?.xp_awarded > 0;

    if (passed) {
      let xpRes = { finalAmount: 0, multiplier: 1 };
      if (!alreadyAwarded) {
        // Award lesson XP + quiz XP
        const lessonResult = await awardXP.mutateAsync({
          amount: lesson.xp_reward,
          source: 'lesson',
          referenceId: lesson.id,
        });
        const quizRes = await awardXP.mutateAsync({
          amount: 50,
          source: 'quiz',
          referenceId: lesson.id,
        });
        xpRes = { finalAmount: lessonResult.finalAmount + quizRes.finalAmount, multiplier: lessonResult.multiplier };
      }
      setXpResult(xpRes);

      await updateProgress.mutateAsync({
        lessonId: lesson.id,
        moduleId: lesson.module_id,
        updates: {
          status: 'completed',
          quiz_score: (score / total) * 100,
          quiz_passed: true,
          xp_awarded: alreadyAwarded ? existingProgress.xp_awarded : (lesson.xp_reward + 50),
          completed_at: new Date().toISOString(),
        },
      });

      // Update module progress
      // This is simplified — in production you'd check all lessons
      setStep('complete');
    } else {
      await updateProgress.mutateAsync({
        lessonId: lesson.id,
        moduleId: lesson.module_id,
        updates: {
          status: 'failed',
          quiz_score: (score / total) * 100,
          quiz_passed: false,
        },
      });
      setStep('complete');
    }
  };

  if (step === 'complete') {
    return (
      <LessonComplete
        lesson={lesson}
        quizResult={quizResult}
        xpResult={xpResult}
        onBack={onComplete}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground">{lesson.title}</h2>
          <p className="text-[11px] text-muted-foreground">Lesson {lesson.lesson_number}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 px-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? 'bg-primary' : 'bg-muted/30'
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-center capitalize">{step}</p>

      {/* Step content */}
      {step === 'learn' && (
        <LearnStep cards={lesson.cards} onComplete={handleLearnComplete} />
      )}
      {step === 'practice' && (
        <PracticeStep tasks={lesson.practice_tasks} onComplete={handlePracticeComplete} />
      )}
      {step === 'log' && (
        <LogStep onComplete={handleLogComplete} />
      )}
      {step === 'quiz' && (
        <QuizStep questions={lesson.quiz_questions} onComplete={handleQuizComplete} />
      )}
    </div>
  );
};

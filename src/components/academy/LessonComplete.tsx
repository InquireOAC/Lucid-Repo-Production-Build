import React from 'react';
import { AcademyLesson } from '@/hooks/useAcademyLesson';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface LessonCompleteProps {
  lesson: AcademyLesson;
  quizResult: { score: number; total: number; passed: boolean } | null;
  xpResult: { finalAmount: number; multiplier: number } | null;
  onBack: () => void;
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  lesson,
  quizResult,
  xpResult,
  onBack,
}) => {
  const passed = quizResult?.passed ?? false;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      {passed ? (
        <>
          <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Lesson Complete! 🎉</h2>
            <p className="text-muted-foreground text-sm">{lesson.title}</p>
          </div>

          {quizResult && (
            <div className="rounded-xl bg-card border border-border/50 p-4 w-full max-w-xs text-center space-y-2">
              <p className="text-sm text-muted-foreground">Quiz Score</p>
              <p className="text-3xl font-bold text-foreground">{quizResult.score}/{quizResult.total}</p>
            </div>
          )}

          {xpResult && xpResult.finalAmount > 0 && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 w-full max-w-xs text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles size={16} className="text-primary" />
                <span className="text-lg font-bold text-primary">+{xpResult.finalAmount} XP</span>
              </div>
              {xpResult.multiplier > 1 && (
                <p className="text-xs text-muted-foreground">
                  {xpResult.multiplier}x streak multiplier applied!
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-red-400/20 flex items-center justify-center">
            <XCircle size={40} className="text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Not Quite!</h2>
            <p className="text-muted-foreground text-sm">
              You need 80% to pass. Score: {quizResult?.score}/{quizResult?.total}
            </p>
            <p className="text-xs text-muted-foreground">
              Review the material and try again anytime.
            </p>
          </div>
        </>
      )}

      <Button variant="aurora" onClick={onBack} className="w-full max-w-xs">
        Back to Academy
      </Button>
    </div>
  );
};

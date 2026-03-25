import React from 'react';
import { ModuleWithProgress } from '@/hooks/useAcademyModules';
import { AcademyLesson } from '@/hooks/useAcademyLesson';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface ModuleDetailProps {
  module: ModuleWithProgress;
  lessons: AcademyLesson[];
  lessonProgress: any[];
  onBack: () => void;
  onLessonClick: (lesson: AcademyLesson) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({
  module,
  lessons,
  lessonProgress,
  onBack,
  onLessonClick,
}) => {
  const progressMap = new Map(lessonProgress.map(p => [p.lesson_id, p]));

  const getStatusIcon = (lessonId: string, index: number) => {
    const p = progressMap.get(lessonId);
    if (p?.status === 'completed') return <CheckCircle2 size={18} className="text-emerald-400" />;
    if (p && p.status !== 'not_started') return <PlayCircle size={18} className="text-primary" />;

    // Check if previous lesson is completed (or it's the first)
    if (index === 0) return <Circle size={18} className="text-muted-foreground" />;
    const prevLesson = lessons[index - 1];
    const prevProgress = progressMap.get(prevLesson.id);
    if (prevProgress?.status === 'completed') return <Circle size={18} className="text-muted-foreground" />;
    return <Circle size={18} className="text-muted-foreground/40" />;
  };

  const isLessonAccessible = (index: number) => {
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    const prevProgress = progressMap.get(prevLesson.id);
    return prevProgress?.status === 'completed';
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>{module.icon}</span> {module.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {lessons.map((lesson, i) => {
          const accessible = isLessonAccessible(i);
          return (
            <button
              key={lesson.id}
              onClick={() => accessible && onLessonClick(lesson)}
              disabled={!accessible}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-colors text-left ${
                accessible
                  ? 'bg-card border-border/50 hover:border-primary/30'
                  : 'bg-muted/10 border-border/20 opacity-50 cursor-not-allowed'
              }`}
            >
              {getStatusIcon(lesson.id, i)}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground">
                  {lesson.lesson_number}. {lesson.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {lesson.cards.length} cards • {lesson.quiz_questions.length} quiz questions • +{lesson.xp_reward} XP
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

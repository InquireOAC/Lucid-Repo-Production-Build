import React, { useState } from 'react';
import { PracticeTask } from '@/hooks/useAcademyLesson';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface PracticeStepProps {
  tasks: PracticeTask[];
  onComplete: () => void;
}

export const PracticeStep: React.FC<PracticeStepProps> = ({ tasks, onComplete }) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border/50 p-5 space-y-3">
        <h3 className="text-base font-semibold text-foreground">Practice Tasks</h3>
        <p className="text-xs text-muted-foreground">Complete these tasks before moving on:</p>

        <div className="space-y-2.5 pt-1">
          {tasks.map((task, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex items-start gap-3 w-full text-left p-2.5 rounded-lg hover:bg-muted/10 transition-colors"
            >
              {checked.has(i) ? (
                <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <Circle size={18} className="text-muted-foreground mt-0.5 shrink-0" />
              )}
              <span className={`text-sm ${checked.has(i) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {task.task}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="aurora"
        onClick={onComplete}
        className="w-full"
      >
        I've completed my practice →
      </Button>
    </div>
  );
};

import React, { useState } from 'react';
import { QuizQuestion } from '@/hooks/useAcademyLesson';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizStepProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export const QuizStep: React.FC<QuizStepProps> = ({ questions, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[current];
  const isCorrect = selected === q.correct_index;
  const isLast = current === questions.length - 1;

  const handleCheck = () => {
    if (selected === null) return;
    setRevealed(true);
    if (isCorrect) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      const finalScore = correctCount + (isCorrect && !revealed ? 0 : 0); // already counted
      onComplete(correctCount + (isCorrect ? 0 : 0), questions.length);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setRevealed(false);
  };

  // If we just finished the last question
  if (isLast && revealed) {
    const finalScore = isCorrect ? correctCount : correctCount;
    // Show next which triggers onComplete
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border/50 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-foreground">Quiz</h3>
          <span className="text-xs text-muted-foreground">{current + 1}/{questions.length}</span>
        </div>

        <p className="text-sm text-foreground font-medium">{q.question}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let classes = 'border-border/50 hover:border-primary/30';
            if (revealed) {
              if (i === q.correct_index) classes = 'border-emerald-400 bg-emerald-400/10';
              else if (i === selected) classes = 'border-red-400 bg-red-400/10';
            } else if (i === selected) {
              classes = 'border-primary bg-primary/10';
            }

            return (
              <button
                key={i}
                onClick={() => !revealed && setSelected(i)}
                disabled={revealed}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${classes}`}
              >
                <span className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {letter}
                </span>
                <span className="text-sm text-foreground">{opt}</span>
                {revealed && i === q.correct_index && <CheckCircle2 size={16} className="text-emerald-400 ml-auto" />}
                {revealed && i === selected && i !== q.correct_index && <XCircle size={16} className="text-red-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {!revealed ? (
        <Button
          variant="default"
          onClick={handleCheck}
          disabled={selected === null}
          className="w-full"
        >
          Check Answer
        </Button>
      ) : (
        <Button
          variant="aurora"
          onClick={() => {
            if (isLast) {
              onComplete(correctCount, questions.length);
            } else {
              handleNext();
            }
          }}
          className="w-full"
        >
          {isLast ? 'See Results' : 'Next Question →'}
        </Button>
      )}
    </div>
  );
};

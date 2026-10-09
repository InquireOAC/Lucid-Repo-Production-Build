import React, { useState } from 'react';
import { LessonCard } from '@/hooks/useAcademyLesson';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LearnStepProps {
  cards: LessonCard[];
  onComplete: () => void;
}

export const LearnStep: React.FC<LearnStepProps> = ({ cards, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const isLast = current === cards.length - 1;
  const card = cards[current];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border/50 p-6 min-h-[240px] flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">{card.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= current ? 'bg-primary' : 'bg-muted/40'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {current > 0 && (
          <Button variant="outline" size="sm" onClick={() => setCurrent(c => c - 1)} className="flex-1">
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
        )}
        {isLast ? (
          <Button variant="aurora" onClick={onComplete} className="flex-1">
            Start Practice →
          </Button>
        ) : (
          <Button variant="default" onClick={() => setCurrent(c => c + 1)} className="flex-1">
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

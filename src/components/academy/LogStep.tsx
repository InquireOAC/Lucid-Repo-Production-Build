import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogStepProps {
  onComplete: () => void;
}

export const LogStep: React.FC<LogStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border/50 p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Dream Journal Check</h3>
        <p className="text-sm text-muted-foreground">
          Have you logged a dream since starting this practice? Recording your dreams helps reinforce the techniques you're learning.
        </p>

        <div className="rounded-xl bg-muted/10 border border-border/30 p-4 text-center space-y-2">
          <BookOpen size={24} className="text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Log a dream to get the most out of this lesson
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/journal/new')}
          >
            Open Dream Journal
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          AI dream analysis will be available in a future update
        </p>
      </div>

      <Button variant="aurora" onClick={onComplete} className="w-full">
        Continue to Quiz →
      </Button>
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Hand, Clock, CheckCircle } from 'lucide-react';

interface RealityCheckReminderProps {
  onComplete?: () => void;
}

export const RealityCheckReminder = ({ onComplete }: RealityCheckReminderProps) => {
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);
  const [currentCheck, setCurrentCheck] = useState(0);

  const realityChecks = [
    {
      id: 'hands',
      icon: <Hand className="h-6 w-6" />,
      title: 'Look at Your Hands',
      description: 'Examine your hands carefully. Count your fingers. In dreams, hands often appear distorted.',
      action: 'Look at your palms and count your fingers'
    },
    {
      id: 'time',
      icon: <Clock className="h-6 w-6" />,
      title: 'Check the Time',
      description: 'Look at a clock or digital display. Look away, then look back. Time is often inconsistent in dreams.',
      action: 'Check any clock or time display twice'
    },
    {
      id: 'text',
      icon: <Eye className="h-6 w-6" />,
      title: 'Read Some Text',
      description: 'Try reading text, then look away and read it again. Text often changes or becomes unreadable in dreams.',
      action: 'Read any nearby text twice'
    }
  ];

  const handleCompleteCheck = (checkId: string) => {
    if (!completedChecks.includes(checkId)) {
      const newCompleted = [...completedChecks, checkId];
      setCompletedChecks(newCompleted);
      
      if (newCompleted.length === realityChecks.length && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }
  };

  const handleNext = () => {
    setCurrentCheck((prev) => (prev + 1) % realityChecks.length);
  };

  const handlePrevious = () => {
    setCurrentCheck((prev) => (prev - 1 + realityChecks.length) % realityChecks.length);
  };

  const check = realityChecks[currentCheck];
  const isCompleted = completedChecks.includes(check.id);
  const allCompleted = completedChecks.length === realityChecks.length;

  return (
    <Card className="relative overflow-hidden w-full max-w-md mx-auto border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              {check.icon}
            </div>
            Reality Check Training
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            {completedChecks.length}/{realityChecks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        {allCompleted ? (
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/15 to-green-600/10 border border-green-500/30">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4 animate-float" />
            <h3 className="text-xl font-bold mb-2 text-green-400">Great Job!</h3>
            <p className="text-sm text-muted-foreground">
              You've completed all reality checks. Practice these throughout the day to build dream awareness!
            </p>
          </div>
        ) : (
          <>
            {/* Current Check */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  {check.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground">{check.title}</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {check.description}
              </p>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-sm font-semibold text-primary">
                  Action: {check.action}
                </p>
              </div>
            </div>

            {/* Complete Check Button */}
            <Button
              onClick={() => handleCompleteCheck(check.id)}
              disabled={isCompleted}
              className={`w-full ${
                isCompleted 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                'I Did This Check'
              )}
            </Button>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrevious}
                variant="outline"
                size="sm"
                className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* Progress Indicators */}
        <div className="flex gap-2 justify-center">
          {realityChecks.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentCheck
                  ? 'bg-primary scale-125'
                  : completedChecks.includes(realityChecks[index].id)
                  ? 'bg-green-400'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
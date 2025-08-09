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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {check.icon}
            Reality Check Training
          </span>
          <Badge variant="outline">
            {completedChecks.length}/{realityChecks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allCompleted ? (
          <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
            <p className="text-sm text-muted-foreground">
              You've completed all reality checks. Practice these throughout the day to build dream awareness!
            </p>
          </div>
        ) : (
          <>
            {/* Current Check */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {check.icon}
                <h3 className="text-lg font-semibold">{check.title}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {check.description}
              </p>
              
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  Action: {check.action}
                </p>
              </div>
            </div>

            {/* Complete Check Button */}
            <Button
              onClick={() => handleCompleteCheck(check.id)}
              disabled={isCompleted}
              className="w-full"
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
            <div className="flex gap-2">
              <Button
                onClick={handlePrevious}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                className="flex-1"
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
              className={`w-2 h-2 rounded-full ${
                index === currentCheck
                  ? 'bg-primary'
                  : completedChecks.includes(realityChecks[index].id)
                  ? 'bg-green-500'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
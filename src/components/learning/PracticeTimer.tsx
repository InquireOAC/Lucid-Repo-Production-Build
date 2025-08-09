import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface PracticeTimerProps {
  duration: number; // in minutes
  title: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const PracticeTimer = ({ 
  duration, 
  title, 
  onComplete,
  autoStart = false 
}: PracticeTimerProps) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = duration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isCompleted, onComplete]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
    setIsCompleted(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-2">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!isActive && !isCompleted && (
            <Button onClick={handleStart} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
          
          {isActive && (
            <Button onClick={handlePause} variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {(isActive || timeLeft < totalTime) && (
            <Button onClick={handleStop} variant="outline" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
          
          {(timeLeft < totalTime || isCompleted) && (
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-green-600 font-medium">
              🎉 Practice completed! Great job!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
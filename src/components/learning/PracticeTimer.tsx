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
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Play className="h-5 w-5 text-primary" />
          </div>
          Practice Timer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
          
          {/* Timer Display */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 mb-4">
            <div className="text-5xl font-mono font-bold mb-4 text-primary">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="h-3 bg-muted/30" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          {!isActive && !isCompleted && (
            <Button 
              onClick={handleStart} 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
          
          {isActive && (
            <Button 
              onClick={handlePause} 
              variant="outline" 
              size="sm"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {(isActive || timeLeft < totalTime) && (
            <Button 
              onClick={handleStop} 
              variant="outline" 
              size="sm"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
          
          {(timeLeft < totalTime || isCompleted) && (
            <Button 
              onClick={handleReset} 
              variant="outline" 
              size="sm"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/15 to-green-600/10 border border-green-500/30">
            <div className="text-green-400 font-semibold text-lg">
              🎉 Practice completed! Great job!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface TimedWriteSessionProps {
  duration: number; // in minutes
  onComplete: (wordCount: number) => void;
}

export const TimedWriteSession: React.FC<TimedWriteSessionProps> = ({
  duration,
  onComplete,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // in seconds
  const [content, setContent] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSeconds = duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      toast.success(`Time's up! You wrote ${wordCount} words`);
      onComplete(wordCount);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, wordCount, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!content.trim()) {
      toast.error("Start writing your dream first!");
      return;
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setContent("");
    setIsCompleted(false);
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {duration}-Minute Dream Writing Session
          </span>
          <span className="text-2xl font-mono">{formatTime(timeLeft)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm">
            💡 <strong>Instructions:</strong> Write as much as you can remember about your dream. Don't worry about perfect grammar - just capture the memories before they fade!
          </p>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start with 'I am...' or 'I was...' and describe your dream..."
          className="min-h-[300px] glass-card"
          disabled={isCompleted}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Word count: <span className="font-semibold text-white">{wordCount}</span>
          </div>

          <div className="flex gap-2">
            {!isActive && !isCompleted && (
              <Button onClick={handleStart} disabled={!content.trim()}>
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            )}
            {isActive && (
              <Button onClick={handlePause} variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {(isCompleted || timeLeft < totalSeconds) && (
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-400">
              ✓ Session Complete! You captured {wordCount} words in {duration} minutes. +10 XP earned!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

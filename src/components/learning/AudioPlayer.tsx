import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { useAudioManager } from '@/hooks/useAudioManager';

interface AudioPlayerProps {
  onSessionComplete?: (duration: number) => void;
}

export const AudioPlayer = ({ onSessionComplete }: AudioPlayerProps) => {
  const { generateBinauralBeat, isPlaying, currentTrack, play, pause, stop, setVolume } = useAudioManager();
  const [selectedFrequency, setSelectedFrequency] = useState<number>(40);
  const [sessionDuration, setSessionDuration] = useState<number>(10);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const frequencies = [
    { hz: 40, name: 'Gamma - Lucid Awareness', description: 'High consciousness state' },
    { hz: 10, name: 'Alpha - Relaxation', description: 'Calm, focused state' },
    { hz: 6, name: 'Theta - REM Sleep', description: 'Deep meditation, dreams' },
    { hz: 4, name: 'Delta - Deep Sleep', description: 'Restorative sleep' }
  ];

  const startSession = async () => {
    try {
      await generateBinauralBeat(selectedFrequency);
      await play();
      setSessionActive(true);
      setTimeRemaining(sessionDuration * 60);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start audio session:', error);
    }
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stop();
    setSessionActive(false);
    if (onSessionComplete) {
      onSessionComplete(sessionDuration);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Binaural Beats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Choose Frequency:</label>
          {frequencies.map((freq) => (
            <div
              key={freq.hz}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFrequency === freq.hz
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
              onClick={() => setSelectedFrequency(freq.hz)}
            >
              <div className="font-medium">{freq.name}</div>
              <div className="text-sm text-muted-foreground">{freq.description}</div>
            </div>
          ))}
        </div>

        {/* Session Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Session Duration: {sessionDuration} minutes
          </label>
          <Slider
            value={[sessionDuration]}
            onValueChange={([value]) => setSessionDuration(value)}
            min={5}
            max={60}
            step={5}
            className="w-full"
          />
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {sessionActive ? (
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono">
                {formatTime(timeRemaining)}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={endSession}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={startSession}
              className="w-full"
              disabled={!selectedFrequency}
            >
              <Play className="h-4 w-4 mr-2" />
              Start {sessionDuration}min Session
            </Button>
          )}
        </div>

        {/* Volume Control */}
        {(isPlaying || sessionActive) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Volume</label>
            <Slider
              defaultValue={[50]}
              onValueChange={([value]) => setVolume(value / 100)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
  title?: string;
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  className,
  title = "Audio Recording",
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        setHasError(true);
      });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      if (isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      } else {
        setDuration(0);
      }
      setIsLoading(false);
      setHasError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  if (hasError) {
    return (
      <div className={cn("text-sm text-muted-foreground text-center py-2", className)}>
        Audio could not be loaded
      </div>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 p-2 bg-muted/30 rounded-lg", className)}>
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlay}
          disabled={isLoading || hasError}
          className="h-8 w-8 p-0"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <div
            className="h-1 bg-muted rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={toggleMute}
          disabled={isLoading || hasError}
          className="h-8 w-8 p-0"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div className={cn("bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="h-2 bg-muted rounded-full cursor-pointer relative overflow-hidden group"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-150"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          onClick={togglePlay}
          disabled={isLoading || hasError}
          className="bg-primary/10 hover:bg-primary/20 text-primary border-0"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={toggleMute}
          disabled={isLoading || hasError}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
    </div>
  );
};
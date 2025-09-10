import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Upload, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcription: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onClear,
  disabled = false,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setHasRecording(true);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());

        // Start transcription
        await transcribeAudio(blob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Call voice-to-text edge function
        const response = await fetch('/api/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        if (!response.ok) {
          throw new Error('Transcription failed');
        }

        const result = await response.json();
        if (result.success && result.text) {
          onRecordingComplete(blob, result.text);
          toast.success('Recording transcribed successfully!');
        } else {
          throw new Error(result.error || 'Transcription failed');
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe recording. You can still use the audio.');
      // Still call onRecordingComplete with empty transcription
      onRecordingComplete(blob, '');
    } finally {
      setIsTranscribing(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setHasRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    onClear?.();
    toast.success('Recording cleared');
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Recording Interface */}
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Recording Button */}
          <Button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isTranscribing}
            size="lg"
            className={cn(
              "h-16 w-16 rounded-full transition-all duration-300",
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/30" 
                : "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/30"
            )}
          >
            {isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {/* Recording Animation */}
          {isRecording && (
            <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping" />
          )}
        </div>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-red-500">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium">Recording: {formatTime(recordingTime)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tap the square to stop recording
          </p>
        </div>
      )}

      {/* Transcription Status */}
      {isTranscribing && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Transcribing audio...</span>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      {hasRecording && !isRecording && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recording ({formatTime(recordingTime)})</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playRecording}
                disabled={isTranscribing}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearRecording}
                disabled={isTranscribing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              className="hidden"
            />
          )}
        </div>
      )}

      {/* Instructions */}
      {!hasRecording && !isRecording && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Tap the microphone to record your dream</p>
          <p>Your voice will be automatically transcribed</p>
        </div>
      )}
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Upload, Radio, Circle, StopCircle } from 'lucide-react';
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
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
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
        setRecordingState('stopped');
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());

        // Start transcription
        await transcribeAudio(blob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState('recording');
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

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      toast.success('Recording paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      
      // Resume recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording resumed');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      
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
    setRecordingState('idle');
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
      <div className="flex items-center justify-center gap-3">
        {recordingState === 'idle' && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled || isTranscribing}
            size="lg"
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-red-500/30"
          >
            <Circle className="h-6 w-6 fill-current" />
          </Button>
        )}

        {recordingState === 'recording' && (
          <>
            <Button
              type="button"
              onClick={pauseRecording}
              disabled={disabled || isTranscribing}
              size="lg"
              className="h-12 w-12 rounded-full bg-yellow-500 hover:bg-yellow-600"
            >
              <Pause className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              onClick={stopRecording}
              disabled={disabled || isTranscribing}
              size="lg"
              className="h-12 w-12 rounded-full bg-gray-500 hover:bg-gray-600"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Button
              type="button"
              onClick={resumeRecording}
              disabled={disabled || isTranscribing}
              size="lg"
              className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600"
            >
              <Play className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              onClick={stopRecording}
              disabled={disabled || isTranscribing}
              size="lg"
              className="h-12 w-12 rounded-full bg-gray-500 hover:bg-gray-600"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Recording Status */}
      {recordingState === 'recording' && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-red-500">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium">Recording: {formatTime(recordingTime)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tap pause to pause or stop to finish
          </p>
        </div>
      )}

      {recordingState === 'paused' && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium">Paused: {formatTime(recordingTime)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tap play to resume or stop to finish
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
      {hasRecording && recordingState !== 'recording' && recordingState !== 'paused' && (
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
      {!hasRecording && recordingState === 'idle' && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Tap the red circle to start recording your dream</p>
          <p>Your voice will be automatically transcribed</p>
        </div>
      )}
    </div>
  );
};
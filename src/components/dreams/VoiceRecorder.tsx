import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Upload, Radio, Circle, StopCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onTranscriptionComplete?: (text: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onTranscriptionComplete,
  onClear,
  disabled = false,
  className,
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

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

      // Check for supported MIME types - iOS prefers MP4/AAC
      let mimeType = 'audio/webm;codecs=opus';
      if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2';
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        mimeType = 'audio/aac';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      console.log('Using MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setHasRecording(true);
        setRecordingState('stopped');
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());

        // Send the audio blob to parent for processing
        onRecordingComplete(blob);

        // Auto-transcribe the recording
        if (onTranscriptionComplete) {
          transcribeAudio(blob);
        }
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
      
      // More specific error handling for iOS
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Microphone access denied. Please enable in Settings > Safari > Camera & Microphone');
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found on this device');
        } else if (error.name === 'NotSupportedError') {
          toast.error('Audio recording not supported on this device/browser');
        } else {
          toast.error(`Recording failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
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
            disabled={disabled}
            size="sm"
            className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-md hover:shadow-red-500/20 flex items-center justify-center"
          >
            <Circle className="h-4 w-4 fill-current" />
          </Button>
        )}

        {recordingState === 'recording' && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={pauseRecording}
              disabled={disabled}
              size="sm"
              className="h-10 px-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              <span className="text-xs font-medium">Pause</span>
            </Button>
            <Button
              type="button"
              onClick={stopRecording}
              disabled={disabled}
              size="sm"
              className="h-10 px-3 rounded-lg bg-gray-500 hover:bg-gray-600 flex items-center gap-2"
            >
              <StopCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Stop</span>
            </Button>
          </div>
        )}

        {recordingState === 'paused' && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={resumeRecording}
              disabled={disabled}
              size="sm"
              className="h-10 px-3 rounded-lg bg-green-500 hover:bg-green-600 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              <span className="text-xs font-medium">Resume</span>
            </Button>
            <Button
              type="button"
              onClick={stopRecording}
              disabled={disabled}
              size="sm"
              className="h-10 px-3 rounded-lg bg-gray-500 hover:bg-gray-600 flex items-center gap-2"
            >
              <StopCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Stop</span>
            </Button>
          </div>
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
            Use Pause to pause or Stop to finish recording
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
            Use Resume to continue or Stop to finish recording
          </p>
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
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearRecording}
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

      {/* Transcribing State */}
      {isTranscribing && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Transcribing your dream...</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Converting speech to text using AI
          </p>
        </div>
      )}

      {/* Instructions */}
      {!hasRecording && recordingState === 'idle' && !isTranscribing && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Tap the red circle to start recording your dream</p>
          <p>Your voice will be automatically transcribed</p>
        </div>
      )}
    </div>
  );

  async function transcribeAudio(blob: Blob) {
    setIsTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64, mimeType: blob.type || 'audio/webm' },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Transcription failed');

      const text = data.text?.trim();
      if (text) {
        onTranscriptionComplete?.(text);
        toast.success('Transcription complete');
      } else {
        toast.error('No speech detected in recording');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      toast.error('Failed to transcribe audio: ' + (err.message || 'Unknown error'));
    } finally {
      setIsTranscribing(false);
    }
  }
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:audio/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
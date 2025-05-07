
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  existingAudioUrl?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete,
  existingAudioUrl
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Clean up any existing audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Clean up any existing blob URLs to prevent memory leaks
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (existingAudioUrl) {
      console.log("Setting existing audio URL:", existingAudioUrl);
      setAudioUrl(existingAudioUrl);
    }
  }, [existingAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Clean up previous blob URL if exists
        if (audioUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const url = URL.createObjectURL(audioBlob);
        console.log("Created new audio blob URL:", url);
        setAudioUrl(url);
        onRecordingComplete(url);
        
        // Stop tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      onRecordingComplete('');
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) {
      toast.error("No audio recording available");
      return;
    }
    
    if (!audioRef.current) {
      console.log("Creating preview audio element with URL:", audioUrl);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current.onerror = (e) => {
        console.error("Error playing audio:", e);
        toast.error("Could not play audio recording");
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast.error("Could not play audio");
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!audioUrl ? (
        // Recording controls
        <>
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "outline"}
            className="h-8 px-2 flex items-center"
            onClick={isRecording ? stopRecording : startRecording}
            type="button"
          >
            {isRecording ? (
              <>
                <MicOff size={16} className="mr-1" /> Stop ({formatTime(recordingTime)})
              </>
            ) : (
              <>
                <Mic size={16} className="mr-1" /> Record Voice
              </>
            )}
          </Button>
        </>
      ) : (
        // Playback controls
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={togglePlayback}
            type="button"
          >
            {isPlaying ? (
              <>
                <Pause size={16} className="mr-1" /> Pause
              </>
            ) : (
              <>
                <Play size={16} className="mr-1" /> Play
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={deleteRecording}
            type="button"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;

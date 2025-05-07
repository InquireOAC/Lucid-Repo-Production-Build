
import { useState, useRef } from "react";
import { toast } from "sonner";

export function useAudioPlayback(audioUrl: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
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

  return {
    isPlaying,
    togglePlayback,
    cleanup
  };
}

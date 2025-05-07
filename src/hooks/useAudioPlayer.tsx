
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useAudioPlayer() {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleAudio = (dreamId: string, audioUrl?: string) => {
    console.log("Toggling audio for dream:", dreamId, "with URL:", audioUrl);
    
    // If current audio is playing and we're clicking the same dream
    if (playingAudioId === dreamId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }
    
    // If no audio URL provided
    if (!audioUrl) {
      console.log("No audio URL provided for dream:", dreamId);
      toast.error("No audio recording available");
      return;
    }
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Play the new audio
    console.log("Creating new audio element with URL:", audioUrl);
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('ended', () => {
      setPlayingAudioId(null);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Error playing audio:', e);
      toast.error("Could not play audio recording");
      setPlayingAudioId(null);
    });
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      toast.error("Could not play audio recording");
      setPlayingAudioId(null);
    });
    
    audioRef.current = audio;
    setPlayingAudioId(dreamId);
  };

  return {
    playingAudioId,
    handleToggleAudio
  };
}

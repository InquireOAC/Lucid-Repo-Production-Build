
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";

interface DreamDetailAudioProps {
  audioUrl?: string;
}

const DreamDetailAudio = ({ audioUrl }: DreamDetailAudioProps) => {
  console.log("DreamDetailAudio rendering with URL:", audioUrl);
  
  // Check if the audioUrl is valid - either a string URL or a blob URL
  const validAudioUrl = audioUrl && 
    (typeof audioUrl === 'string' && audioUrl.length > 0) && 
    !(typeof audioUrl === 'object'); // Make sure it's not an object
  
  // Use the actual string URL or null, not a boolean value
  const { isPlaying, togglePlayback, cleanup } = useAudioPlayback(validAudioUrl ? audioUrl : null);
  
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  if (!validAudioUrl) {
    console.log("No valid audio URL provided, not rendering audio component");
    return null; // Don't render anything if no audio URL is provided
  }

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        className={`w-full flex items-center justify-center gap-2 ${
          isPlaying ? "bg-green-500/10 text-green-600 border-green-400" : "bg-blue-500/10 text-blue-600 border-blue-400"
        }`}
        onClick={togglePlayback}
      >
        {isPlaying ? (
          <>
            <Pause size={16} /> Pause Audio Recording
          </>
        ) : (
          <>
            <Play size={16} /> Play Audio Recording
          </>
        )}
      </Button>
    </div>
  );
};

export default DreamDetailAudio;


import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DreamDetailAudioProps {
  audioUrl?: string;
  isPlaying: boolean;
  toggleAudio: () => void;
}

const DreamDetailAudio = ({
  audioUrl,
  isPlaying,
  toggleAudio
}: DreamDetailAudioProps) => {
  console.log("DreamDetailAudio rendering with URL:", audioUrl);
  
  if (!audioUrl) {
    console.log("No audio URL provided, not rendering audio component");
    return null;
  }

  const isValidAudioUrl = (url: string): boolean => {
    try {
      if (url.startsWith('blob:') || 
          url.startsWith('http://') || 
          url.startsWith('https://') ||
          url.startsWith('data:audio/')) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  if (!isValidAudioUrl(audioUrl)) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>
          Invalid audio URL format. Audio playback is unavailable.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        className={`w-full flex items-center justify-center gap-2 ${
          isPlaying ? "bg-green-500/10 text-green-600 border-green-400" : "bg-blue-500/10 text-blue-600 border-blue-400"
        }`}
        onClick={toggleAudio}
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

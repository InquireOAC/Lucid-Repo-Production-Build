
import React, { useEffect } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import RecordingButton from "@/components/audio/RecordingButton";
import PlaybackControls from "@/components/audio/PlaybackControls";

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  existingAudioUrl?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete,
  existingAudioUrl
}) => {
  const {
    isRecording,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    deleteRecording
  } = useAudioRecorder(onRecordingComplete, existingAudioUrl);
  
  const {
    isPlaying,
    togglePlayback,
    cleanup: cleanupAudio
  } = useAudioPlayback(audioUrl);
  
  // Clean up audio player when recording is deleted
  useEffect(() => {
    if (!audioUrl) {
      cleanupAudio();
    }
  }, [audioUrl]);

  const handleDeleteRecording = () => {
    cleanupAudio();
    deleteRecording();
  };

  return (
    <div className="flex items-center gap-2">
      {!audioUrl ? (
        // Recording controls
        <RecordingButton
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      ) : (
        // Playback controls
        <PlaybackControls
          isPlaying={isPlaying}
          onTogglePlayback={togglePlayback}
          onDelete={handleDeleteRecording}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;

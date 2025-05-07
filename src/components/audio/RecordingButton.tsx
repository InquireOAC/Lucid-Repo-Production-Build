
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";

interface RecordingButtonProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingButton = ({
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording
}: RecordingButtonProps) => {
  return (
    <Button
      size="sm"
      variant={isRecording ? "destructive" : "outline"}
      className="h-8 px-2 flex items-center"
      onClick={isRecording ? onStopRecording : onStartRecording}
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
  );
};

export default RecordingButton;


import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2 } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onDelete: () => void;
}

const PlaybackControls = ({
  isPlaying,
  onTogglePlayback,
  onDelete
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-2"
        onClick={onTogglePlayback}
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
        onClick={onDelete}
        type="button"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

export default PlaybackControls;

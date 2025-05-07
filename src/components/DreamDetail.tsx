
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import { toast } from "sonner";
import DreamDetailContent from "@/components/dreams/DreamDetailContent";
import DreamDetailAudio from "@/components/dreams/DreamDetailAudio";
import DreamDetailActions from "@/components/dreams/DreamDetailActions";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<DreamEntry>) => void;
  onDelete?: (id: string) => void;
  isAuthenticated?: boolean;
}

const DreamDetail = ({ dream, tags, onClose, onUpdate, onDelete, isAuthenticated }: DreamDetailProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;
  
  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    };
  }, []);

  const handleTogglePublic = async () => {
    if (onUpdate) {
      const newStatus = !(dream.is_public || dream.isPublic);
      await onUpdate(dream.id, { 
        is_public: newStatus,
        isPublic: newStatus
      });
    }
  };

  const handleDeleteDream = async () => {
    if (onDelete) {
      onDelete(dream.id);
    }
  };

  const toggleAudio = () => {
    if (!audioUrl) return;
    
    if (!audioElement) {
      console.log("Creating new audio element with URL:", audioUrl);
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error("Could not play audio recording");
      });
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error("Could not play audio recording");
        });
        setIsPlaying(true);
      }
    }
  };
  
  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;

  // Map tag IDs to tag objects
  const dreamTags = dream.tags
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean) as DreamTag[];

  const formattedDate = format(new Date(dream.date), "MMMM d, yyyy");

  console.log("Dream detail rendering with audio URL:", audioUrl);
  
  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl gradient-text">{dream.title}</DialogTitle>
          </DialogHeader>
          
          <DreamDetailContent
            content={dream.content}
            formattedDate={formattedDate}
            dreamTags={dreamTags}
            generatedImage={dream.generatedImage}
            analysis={dream.analysis}
          />
          
          <DreamDetailAudio
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            toggleAudio={toggleAudio}
          />
          
          <DreamDetailActions
            isAuthenticated={isAuthenticated}
            isPublic={isPublic}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onTogglePublic={handleTogglePublic}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The dream will be permanently deleted from your journal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDream}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DreamDetail;

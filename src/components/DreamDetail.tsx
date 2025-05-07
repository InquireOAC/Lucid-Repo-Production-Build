
import React, { useState, useEffect, useRef } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;
  
  console.log("DreamDetail rendering with dream:", dream.title, "audio URL:", audioUrl);
  
  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Also clean up when closing the dialog
  useEffect(() => {
    const handleClose = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    
    return handleClose;
  }, [onClose]);

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
    try {
      if (onDelete) {
        // First close the dialog to prevent UI freezing
        setIsDeleteDialogOpen(false);
        
        // Small delay to ensure dialog closes
        setTimeout(() => {
          onDelete(dream.id);
          // Close the main dream dialog
          onClose();
          toast.success("Dream deleted successfully");
        }, 100);
      } else {
        setIsDeleteDialogOpen(false);
        toast.error("Cannot delete dream - no delete handler provided");
      }
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleAudio = () => {
    if (!audioUrl) {
      console.log("No audio URL provided");
      toast.error("No audio recording available");
      return;
    }

    if (isPlaying) {
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play audio
      if (!audioRef.current) {
        console.log("Creating new audio element with URL:", audioUrl);
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('ended', () => {
          console.log("Audio playback ended");
          setIsPlaying(false);
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Error playing audio:', e);
          toast.error("Could not play audio recording");
          setIsPlaying(false);
        });
        
        audioRef.current = audio;
      }
      
      // Try to reacquire the audio element if URL has changed
      if (audioRef.current.src !== audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('Error playing audio:', e);
          toast.error("Could not play audio recording");
          setIsPlaying(false);
        });
      }
      
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error("Could not play audio recording");
        setIsPlaying(false);
      });
      
      setIsPlaying(true);
    }
  };
  
  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;

  // Map tag IDs to tag objects
  const dreamTags = dream.tags
    ? dream.tags
        .map((tagId) => tags.find((tag) => tag.id === tagId))
        .filter(Boolean) as DreamTag[]
    : [];

  const formattedDate = format(new Date(dream.date), "MMMM d, yyyy");
  
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
          
          {audioUrl && (
            <DreamDetailAudio
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              toggleAudio={toggleAudio}
            />
          )}
          
          <DreamDetailActions
            isAuthenticated={isAuthenticated}
            isPublic={isPublic}
            onDelete={onDelete ? () => setIsDeleteDialogOpen(true) : undefined}
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

import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import { toast } from "sonner";
import DreamDetailContent from "@/components/dreams/DreamDetailContent";
import DreamDetailActions from "@/components/dreams/DreamDetailActions";
import ShareButton from "@/components/share/ShareButton";

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
  
  // Ensure we normalize the dream data for consistency
  const normalizedDream = {
    ...dream,
    generatedImage: dream.generatedImage || dream.image_url || null
  };
  
  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;

  const handleTogglePublic = async () => {
    if (!onUpdate) return;
    
    const newStatus = !(dream.is_public || dream.isPublic);
    
    try {
      await onUpdate(dream.id, { 
        is_public: newStatus,
        isPublic: newStatus
      });
      
      toast.success(newStatus ? "Dream is now public" : "Dream is now private");
    } catch (error) {
      console.error("Error toggling visibility:", error);
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
          // Close the main dream dialog is handled by the parent component
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
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl gradient-text">{dream.title}</DialogTitle>
            </div>
          </DialogHeader>
          
          <DreamDetailContent
            content={dream.content}
            formattedDate={formattedDate}
            dreamTags={dreamTags}
            generatedImage={normalizedDream.generatedImage}
            analysis={dream.analysis}
          />
          
          {audioUrl && (
            <DreamDetailAudio audioUrl={audioUrl} />
          )}
          
          <div className="flex justify-between items-center mt-4">
            <ShareButton dream={normalizedDream} />
            
            <DreamDetailActions
              isAuthenticated={isAuthenticated}
              isPublic={isPublic}
              onTogglePublic={onUpdate ? handleTogglePublic : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog - keeping this code for potential future use */}
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

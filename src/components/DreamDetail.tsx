import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import { toast } from "sonner";
import DreamDetailContent from "@/components/dreams/DreamDetailContent";
import DreamDetailActions from "@/components/dreams/DreamDetailActions";
import ShareButton from "@/components/share/ShareButton";
import DreamComments from "@/components/DreamComments";
import { useAuth } from "@/contexts/AuthContext";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<DreamEntry>) => void;
  onDelete?: (id: string) => void;
  isAuthenticated?: boolean;
  onLike?: () => void; // Add this line to fix the TypeScript error
}

const DreamDetail = ({ dream, tags, onClose, onUpdate, onDelete, isAuthenticated, onLike }: DreamDetailProps) => {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(dream.comment_count || dream.commentCount || 0);
  
  // Ensure we normalize the dream data for consistency
  const normalizedDream = {
    ...dream,
    generatedImage: dream.generatedImage || dream.image_url || null
  };
  
  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;
  
  // Check if the user is the dream owner
  const isOwner = user && user.id === dream.user_id;

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
  
  // Handle comment count updates
  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
    // Update the parent component if needed
    if (onUpdate) {
      onUpdate(dream.id, { 
        comment_count: count,
        commentCount: count 
      });
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
            <div className="mt-4">
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <ShareButton dream={normalizedDream} />
            
            <DreamDetailActions
              isAuthenticated={isAuthenticated}
              isPublic={isPublic}
              onTogglePublic={isOwner && onUpdate ? handleTogglePublic : undefined}
              onLike={onLike} // Pass the onLike prop here
              liked={dream.liked}
              likeCount={dream.likeCount || dream.like_count || 0}
            />
          </div>
          
          {/* Add comments section - only for public dreams */}
          {isPublic && (
            <div className="mt-6">
              <DreamComments 
                dreamId={dream.id} 
                onCommentCountChange={handleCommentCountChange}
              />
            </div>
          )}
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

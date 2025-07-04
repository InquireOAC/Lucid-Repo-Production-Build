
import React, { useState, useEffect } from "react";
import { format, isValid } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import { toast } from "sonner";
import DreamDetailContent from "@/components/dreams/DreamDetailContent";
import DreamDetailActions from "@/components/dreams/DreamDetailActions";
import ShareButton from "@/components/share/ShareButton";
import CopyLinkButton from "@/components/share/CopyLinkButton";
import DreamComments from "@/components/DreamComments";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  dreamTags?: string[]; // NEW!
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<DreamEntry>) => void;
  onDelete?: (id: string) => void;
  isAuthenticated?: boolean;
  onLike?: () => void;
}

const DreamDetail = ({
  dream,
  tags,
  dreamTags,
  onClose,
  onUpdate,
  onDelete,
  isAuthenticated,
  onLike
}: DreamDetailProps) => {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(dream.comment_count || dream.commentCount || 0);

  // Like state for like button near comments
  const [localLiked, setLocalLiked] = useState(dream.liked || false);
  const [localLikeCount, setLocalLikeCount] = useState(dream.likeCount || dream.like_count || 0);

  useEffect(() => {
    setLocalLiked(dream.liked || false);
    setLocalLikeCount(dream.likeCount || dream.like_count || 0);
  }, [dream.liked, dream.likeCount, dream.like_count]);

  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;

  const isOwner = user && user.id === dream.user_id;
  const isPublic = dream.is_public || dream.isPublic;

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
        setIsDeleteDialogOpen(false);
        setTimeout(() => {
          onDelete(dream.id);
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

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
    if (onUpdate) {
      onUpdate(dream.id, { 
        comment_count: count,
        commentCount: count 
      });
    }
  };

  // Map tag IDs to tag objects using dreamTags if provided, else dream.tags
  const tagIdList: string[] = dreamTags ?? dream.tags ?? [];
  const mappedTags = tagIdList
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean) as DreamTag[];

  // Safe date formatting with validation - only return valid dates
  const formatDreamDate = (dateValue: string | undefined) => {
    if (!dateValue) {
      return null;
    }
    
    const date = new Date(dateValue);
    if (!isValid(date)) {
      console.warn("Invalid date value:", dateValue);
      return null;
    }
    
    return format(date, "MMMM d, yyyy");
  };

  const formattedDate = formatDreamDate(dream.date || dream.created_at);

  // Don't render if we don't have essential dream data
  if (!dream.id || !dream.title) {
    return null;
  }

  // Handler for near-comments like button (propagate to parent and update local state)
  const handleLikeClick = async () => {
    if (typeof onLike === "function") {
      await onLike();
      // Optimistically update like count
      setLocalLiked((prev) => !prev);
      setLocalLikeCount((prev) => prev + (localLiked ? -1 : 1));
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[420px] mx-auto max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl gradient-text pr-8 break-words">{dream.title}</DialogTitle>
          </DialogHeader>
          
          <div className="w-full overflow-hidden">
            <DreamDetailContent
              content={dream.content}
              formattedDate={formattedDate || ""}
              dreamTags={mappedTags}
              generatedImage={dream.generatedImage || dream.image_url || null}
              analysis={dream.analysis}
              showFlagButton={isPublic && user && !isOwner}
              dreamId={dream.id}
              contentOwnerId={dream.user_id}
              onLike={onLike}
              currentUser={user}
            />
            
            {audioUrl && (
              <div className="mt-4 w-full">
                <audio src={audioUrl} controls className="w-full max-w-full" />
              </div>
            )}

            <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
              <div className="flex gap-2 flex-shrink-0">
                <ShareButton dream={dream} />
                <CopyLinkButton dream={dream} />
              </div>
              <DreamDetailActions
                isAuthenticated={isAuthenticated}
                isPublic={isPublic}
                onTogglePublic={isOwner && onUpdate ? handleTogglePublic : undefined}
                onLike={onLike}
                liked={dream.liked}
              />
            </div>

            {/* Comments */}
            {isPublic && (
              <div className="mt-0 w-full overflow-hidden">
                <DreamComments 
                  dreamId={dream.id} 
                  onCommentCountChange={handleCommentCountChange}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
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


import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamDetail from "@/components/DreamDetail";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DreamDetailWrapperProps {
  selectedDream: DreamEntry | null;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DreamEntry>) => void;
  isAuthenticated: boolean;
  onLike?: (dreamId: string) => void;
}

const DreamDetailWrapper = ({
  selectedDream,
  tags,
  onClose,
  onUpdate,
  isAuthenticated,
  onLike
}: DreamDetailWrapperProps) => {
  if (!selectedDream) return null;
  
  // Ensure we have all possible fields from both camelCase and snake_case versions
  const normalizedDream = {
    ...selectedDream,
    generatedImage: selectedDream.generatedImage || selectedDream.image_url || null,
    imagePrompt: selectedDream.imagePrompt || selectedDream.image_prompt || "",
    isPublic: selectedDream.is_public || selectedDream.isPublic || false,
    likeCount: selectedDream.like_count || selectedDream.likeCount || 0,
    commentCount: selectedDream.comment_count || selectedDream.commentCount || 0,
    tags: Array.isArray(selectedDream.tags) ? selectedDream.tags : []
  };
  
  console.log("Normalized dream in wrapper:", normalizedDream);
  console.log("Image URL in wrapper:", normalizedDream.generatedImage);
  
  const handleUpdate = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      // First make sure we're only sending valid database fields
      const cleanedUpdates: Partial<DreamEntry> = {...updates};
      
      // Make sure both is_public and isPublic are set correctly
      if ('is_public' in cleanedUpdates || 'isPublic' in cleanedUpdates) {
        const newPublicState = cleanedUpdates.is_public ?? cleanedUpdates.isPublic;
        cleanedUpdates.is_public = newPublicState;
        cleanedUpdates.isPublic = newPublicState;
      }
      
      // Call the provided update handler (which will refresh the dream list)
      onUpdate(id, cleanedUpdates);
      
      // If we're making it private, close the modal (common UX pattern)
      if (cleanedUpdates.is_public === false) {
        setTimeout(() => {
          onClose(); // Close the modal after a brief delay
        }, 300);
      }
    } catch (error) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream");
    }
  };

  // Update view count when dream is opened
  React.useEffect(() => {
    if (selectedDream && selectedDream.id) {
      const updateViewCount = async () => {
        try {
          // Increment view count in database
          const { error } = await supabase
            .from("dream_entries")
            .update({ 
              view_count: (selectedDream.view_count || 0) + 1 
            })
            .eq("id", selectedDream.id);

          if (error) {
            console.error("Error updating view count:", error);
          }
        } catch (error) {
          console.error("Error updating view count:", error);
        }
      };

      updateViewCount();
    }
  }, [selectedDream?.id]);

  const handleLike = () => {
    if (onLike && selectedDream) {
      onLike(selectedDream.id);
    }
  };
  
  return (
    <DreamDetail
      dream={normalizedDream}
      tags={tags}
      dreamTags={normalizedDream.tags}
      onClose={onClose}
      onUpdate={handleUpdate}
      isAuthenticated={isAuthenticated}
      onLike={handleLike}
    />
  );
};

export default DreamDetailWrapper;

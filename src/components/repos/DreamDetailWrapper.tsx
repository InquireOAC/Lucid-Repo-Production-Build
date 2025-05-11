
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
}

const DreamDetailWrapper = ({
  selectedDream,
  tags,
  onClose,
  onUpdate,
  isAuthenticated
}: DreamDetailWrapperProps) => {
  if (!selectedDream) return null;
  
  // Ensure we have all possible fields from both camelCase and snake_case versions
  const normalizedDream = {
    ...selectedDream,
    generatedImage: selectedDream.generatedImage,
    imagePrompt: selectedDream.imagePrompt,
    isPublic: selectedDream.is_public || selectedDream.isPublic,
  };
  
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
  
  return (
    <DreamDetail
      dream={normalizedDream}
      tags={tags}
      onClose={onClose}
      onUpdate={handleUpdate}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default DreamDetailWrapper;

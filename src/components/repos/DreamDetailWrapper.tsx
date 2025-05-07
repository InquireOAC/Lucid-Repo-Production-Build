
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
  
  const handleDeleteDream = async (id: string) => {
    try {
      // Delete the dream from Supabase
      const { error } = await supabase
        .from("dream_entries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Close the dream detail modal
      onClose();
      
      // Show success message
      toast.success("Dream deleted successfully");
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
    }
  };
  
  const handleUpdate = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      // First make sure we're only sending valid database fields
      const cleanedUpdates: Partial<DreamEntry> = {...updates};
      
      // Remove client-side only fields that would cause database errors
      if ('audioUrl' in cleanedUpdates) {
        delete cleanedUpdates.audioUrl;
      }
      
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
      dream={selectedDream}
      tags={tags}
      onClose={onClose}
      onUpdate={handleUpdate}
      onDelete={handleDeleteDream}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default DreamDetailWrapper;

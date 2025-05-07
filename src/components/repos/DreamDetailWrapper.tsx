
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
      
      // Force refresh the dreams list
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
    }
  };
  
  return (
    <DreamDetail
      dream={selectedDream}
      tags={tags}
      onClose={onClose}
      onUpdate={onUpdate}
      onDelete={handleDeleteDream}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default DreamDetailWrapper;


import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Heart, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DreamDetail from "@/components/DreamDetail";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SymbolAvatar from "./SymbolAvatar"; // Import SymbolAvatar
import EmptyDreamGrid from "./EmptyDreamGrid";
import DreamCardItem from "./DreamCardItem";
import { showUpdateDreamErrorToast } from "./toastHelpers";

interface DreamGridProps {
  dreams: any[];
  isLiked?: boolean;
  isOwnProfile: boolean;
  emptyTitle: string;
  emptyMessage: {
    own: string;
    other: string;
  };
  emptyIcon: React.ReactNode;
  actionLink: string;
  actionText: string;
  refreshDreams?: () => void;
}

const DreamGrid = ({
  dreams,
  isLiked = false,
  isOwnProfile,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  actionLink,
  actionText,
  refreshDreams,
}: DreamGridProps) => {
  const [selectedDream, setSelectedDream] = useState<any>(null);
  
  // Handle dream deletion - only for own profile
  const handleDeleteDream = async (id: string) => {
    if (!isOwnProfile) return; // Safety check
    
    try {
      // Delete the dream from Supabase
      const { error } = await supabase
        .from("dream_entries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Close the dream detail modal
      setSelectedDream(null);
      
      // Remove the dream from the local list
      // This avoids having to refresh the page
      const updatedDreams = dreams.filter(dream => dream.id !== id);
      dreams.splice(0, dreams.length, ...updatedDreams);
      
      // Show success message
      toast.success("Dream deleted successfully");
      
      // Refresh dreams if the callback is provided
      if (refreshDreams) {
        refreshDreams();
      }
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
    }
  };
  
  // Handle dream update - only for own profile and only for meaningful edits
  const handleUpdateDream = async (id: string, updates: any) => {
    if (!isOwnProfile) return; // Safety check
    
    // Only proceed with database updates for meaningful changes (not just count updates)
    const meaningfulFields = ['title', 'content', 'tags', 'mood', 'lucid', 'analysis', 'generatedImage', 'imagePrompt', 'is_public', 'isPublic'];
    const hasMeaningfulChanges = Object.keys(updates).some(key => meaningfulFields.includes(key));
    
    if (!hasMeaningfulChanges) {
      // Just update local state for passive updates like comment counts
      const dreamIndex = dreams.findIndex(dream => dream.id === id);
      if (dreamIndex !== -1) {
        dreams[dreamIndex] = { ...dreams[dreamIndex], ...updates };
      }
      
      // Update selected dream if it's the one being viewed
      if (selectedDream && selectedDream.id === id) {
        setSelectedDream({ ...selectedDream, ...updates });
      }
      return;
    }
    
    try {
      // Update the dream in Supabase
      const { error } = await supabase
        .from("dream_entries")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
      
      // Update the dream in the local list
      const dreamIndex = dreams.findIndex(dream => dream.id === id);
      if (dreamIndex !== -1) {
        dreams[dreamIndex] = { ...dreams[dreamIndex], ...updates };
      }
      
      // Update the selected dream if it's the one being edited
      if (selectedDream && selectedDream.id === id) {
        setSelectedDream({ ...selectedDream, ...updates });
      }
      
      // Show success message
      toast.success("Dream updated successfully");
      
      // Refresh dreams if the callback is provided
      if (refreshDreams) {
        refreshDreams();
      }
    } catch (error) {
      console.error("Error updating dream:", error);
      showUpdateDreamErrorToast();
    }
  };

  if (dreams.length === 0) {
    return (
      <EmptyDreamGrid
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        isOwnProfile={isOwnProfile}
        actionLink={actionLink}
        actionText={actionText}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {dreams.map((dream: any) => (
          <DreamCardItem
            key={dream.id}
            dream={dream}
            isLiked={isLiked}
            onClick={() => setSelectedDream(dream)}
          />
        ))}
      </div>
      {selectedDream && (
        <DreamDetail
          dream={selectedDream}
          tags={[]} // Pass tags if available
          onClose={() => setSelectedDream(null)}
          onUpdate={isOwnProfile ? handleUpdateDream : undefined}
          onDelete={isOwnProfile ? handleDeleteDream : undefined}
          isAuthenticated={true}
        />
      )}
    </>
  );
};
export default DreamGrid;

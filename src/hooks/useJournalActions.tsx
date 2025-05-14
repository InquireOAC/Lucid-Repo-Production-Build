import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";
import { uploadDreamImage } from "@/utils/imageUtils";

export const useJournalActions = () => {
  const { addEntry, updateEntry, deleteEntry } = useDreamStore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modified to return void to match the expected type in DreamEntryForm
  const handleAddDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string;
    imagePrompt?: string;
    audioUrl?: string;
  }): Promise<void> => {
    setIsSubmitting(true);
    try {
      // First add to local store
      const newDream = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
      });

      console.log("Adding dream with:", {
        analysis: Boolean(dreamData.analysis),
        generatedImage: Boolean(dreamData.generatedImage)
      });

      // If user is logged in, also save to database
      if (user) {
        // Upload image to Supabase storage if provided
        let storedImageUrl = dreamData.generatedImage;
        if (dreamData.generatedImage) {
          storedImageUrl = await uploadDreamImage(newDream.id, dreamData.generatedImage);
        }
        
        // Only include fields that exist in the database schema
        const dbSaveDream = {
          id: newDream.id,
          user_id: user.id,
          title: newDream.title,
          content: newDream.content,
          tags: dreamData.tags,
          mood: dreamData.mood,
          lucid: dreamData.lucid,
          date: newDream.date,
          is_public: false,
          analysis: dreamData.analysis || null,
          generatedImage: storedImageUrl || null,
          imagePrompt: dreamData.imagePrompt || null
        };
        
        const { error } = await supabase
          .from("dream_entries")
          .insert(dbSaveDream);
          
        if (error) {
          console.error("Database error:", error);
          toast.error("Error saving dream to database");
        }
      }
      toast.success("Dream saved successfully!");
      return; // Return void to close the form
    } catch (error) {
      console.error("Error adding dream:", error);
      toast.error("Failed to save dream");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modified to match the signature expected in Journal.tsx
  const handleEditDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string;
    imagePrompt?: string;
    audioUrl?: string;
  }, dreamId: string): Promise<void> => {
    if (!dreamId) {
      console.error("Error: dreamId is required but not provided in handleEditDream");
      toast.error("Failed to update dream: Missing dream ID");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Upload image to Supabase storage if provided
      let storedImageUrl = dreamData.generatedImage;
      if (dreamData.generatedImage) {
        storedImageUrl = await uploadDreamImage(dreamId, dreamData.generatedImage);
      }
      
      // Update with the stored image URL
      const updates = {
        ...dreamData,
        generatedImage: storedImageUrl
      };
      
      await handleUpdateDream(dreamId, updates);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDream = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      // Update local store
      updateEntry(id, updates);

      // If user is logged in, also update in database
      if (user) {
        // Convert the updates to database format
        const dbUpdates: any = { ...updates };

        // Handle compatibility between camelCase and snake_case fields
        if ('isPublic' in dbUpdates) {
          dbUpdates.is_public = dbUpdates.isPublic;
          delete dbUpdates.isPublic;
        }
        
        // Remove fields that don't exist in the database
        const fieldsToRemove = ['commentCount', 'likeCount', 'audioUrl', 'user_id', 'id', 'created_at'];
        
        fieldsToRemove.forEach(field => {
          if (field in dbUpdates) {
            delete dbUpdates[field];
          }
        });
        
        console.log("Updating dream in database:", id, dbUpdates);
        
        const { error } = await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Database update error:", error);
          toast.error("Failed to update dream in database");
          return false;
        }
      }
      
      if (updates.is_public || updates.isPublic) {
        toast.success("Dream shared to Lucid Repo!");
      } else {
        toast.success("Dream updated successfully");
      }
      
      return true;
    } catch (error) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream");
      return false;
    }
  };

  const handleDeleteDream = async (id: string) => {
    try {
      console.log("Deleting dream:", id);
      
      // If user is logged in, delete from database first
      if (user) {
        // First, get the dream entry to find associated image
        const { data, error: fetchError } = await supabase
          .from("dream_entries")
          .select("generatedImage")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
          
        if (!fetchError && data) {
          // If there's an image URL and it's from our Supabase storage
          if (data.generatedImage && 
              data.generatedImage.includes("supabase.co") && 
              data.generatedImage.includes("/storage/v1/object/public/dream_images/")) {
            try {
              // Extract the path from the URL
              const pathMatch = data.generatedImage.match(/\/storage\/v1\/object\/public\/dream_images\/(.+)/);
              if (pathMatch && pathMatch[1]) {
                const path = pathMatch[1];
                await supabase.storage
                  .from("dream_images")
                  .remove([path]);
                  
                console.log("Deleted associated image:", path);
              }
            } catch (imageError) {
              console.error("Error deleting image:", imageError);
              // Continue with deletion even if image removal fails
            }
          }
        }
        
        // Delete from database
        const { error } = await supabase
          .from("dream_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Database deletion error:", error);
          toast.error("Failed to delete dream from database");
          return false;
        }
        
        // Also delete any likes on this dream
        await supabase
          .from("dream_likes")
          .delete()
          .eq("dream_id", id);
          
        // Also delete any comments on this dream
        await supabase
          .from("dream_comments")
          .delete()
          .eq("dream_id", id);
      }
      
      // Once deleted from database, delete from local store
      deleteEntry(id);
      toast.success("Dream deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
      return false;
    }
  };

  const handleTogglePublic = async (dream: DreamEntry) => {
    const newStatus = !(dream.is_public || dream.isPublic);
    try {
      await handleUpdateDream(dream.id, {
        is_public: newStatus,
        isPublic: newStatus
      });
      
      if (newStatus) {
        toast.success("Dream published to Lucid Repo");
      } else {
        toast.success("Dream set to private");
      }
      
      return true;
    } catch (error) {
      console.error("Error toggling dream visibility:", error);
      return false;
    }
  };

  return {
    isSubmitting,
    handleAddDream,
    handleEditDream,
    handleUpdateDream,
    handleDeleteDream,
    handleTogglePublic
  };
};

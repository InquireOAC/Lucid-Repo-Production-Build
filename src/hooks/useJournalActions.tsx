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

  const handleAddDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string; // This could be an OpenAI URL or a Supabase preview URL
    imagePrompt?: string;
    audioUrl?: string;
  }): Promise<void> => {
    setIsSubmitting(true);
    if (!user) {
      toast.error("You must be logged in to save a dream.");
      setIsSubmitting(false);
      return;
    }

    try {
      // First add to local store to get an ID
      const newDream = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
        user_id: user.id, // Ensure user_id is part of the local store entry
      });

      console.log("Adding dream locally with ID:", newDream.id);

      let finalImageUrl = dreamData.generatedImage;

      // If there's a generated image, ensure it's uploaded to its permanent Supabase location
      if (dreamData.generatedImage) {
        console.log("Processing generated image for new dream:", dreamData.generatedImage);
        // uploadDreamImage will handle if it's already a Supabase URL or needs uploading from OpenAI/preview
        const uploadedUrl = await uploadDreamImage(newDream.id, dreamData.generatedImage, user.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log("Final image URL for new dream:", finalImageUrl);
        } else {
          // Handle case where final upload failed, maybe keep preview or OpenAI URL but warn user
          toast.warning("Image was generated but failed to save permanently. It might be temporary.");
        }
      }
      
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
        generatedImage: finalImageUrl || null, // Use the potentially updated finalImageUrl
        image_url: finalImageUrl || null, // Sync both fields
        imagePrompt: dreamData.imagePrompt || null
      };
      
      console.log("Saving dream to database:", dbSaveDream);
      const { error } = await supabase
        .from("dream_entries")
        .insert(dbSaveDream);
          
      if (error) {
        console.error("Database error on insert:", error);
        // If DB save fails, consider rolling back local store add or notifying user more strongly
        toast.error("Error saving dream to database: " + error.message);
        // Potentially: deleteEntry(newDream.id); // Rollback local change
        throw error; // Re-throw to be caught by outer catch
      }
      
      // Update local store entry with the final image URL if it changed
      if (finalImageUrl !== dreamData.generatedImage) {
        updateEntry(newDream.id, { generatedImage: finalImageUrl, image_url: finalImageUrl });
      }

      toast.success("Dream saved successfully!");
      return; 
    } catch (error) {
      console.error("Error adding dream:", error);
      toast.error("Failed to save dream."); // Generic message if specific one wasn't shown
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string; // This could be an OpenAI URL, a Supabase preview URL, or existing Supabase URL
    imagePrompt?: string;
    audioUrl?: string;
  }, dreamId: string): Promise<void> => {
    if (!dreamId) {
      console.error("Error: dreamId is required for editing.");
      toast.error("Failed to update dream: Missing dream ID");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to edit a dream.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = dreamData.generatedImage;

      // If a new image was generated or an existing non-Supabase URL is present
      if (dreamData.generatedImage) {
        console.log("Processing generated/updated image for existing dream:", dreamData.generatedImage);
        const uploadedUrl = await uploadDreamImage(dreamId, dreamData.generatedImage, user.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log("Final image URL for edited dream:", finalImageUrl);
        } else {
          toast.warning("Image update failed. Previous image (if any) will be kept or image may be temporary.");
          // If upload failed, finalImageUrl will retain its original value (dreamData.generatedImage)
          // which might be the old Supabase URL or the temporary OpenAI URL.
          // Consider fetching existing dream's image if this is critical.
        }
      }
      
      const updates = {
        ...dreamData,
        generatedImage: finalImageUrl, // Use the potentially updated finalImageUrl
        image_url: finalImageUrl, // Sync both fields
      };
      
      // Call the common update handler
      await handleUpdateDream(dreamId, updates); // handleUpdateDream will show success/error toasts
    } catch (error) {
        console.error("Error editing dream:", error);
        toast.error("Failed to update dream."); // Generic message if specific one wasn't shown
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDream = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      // If user is logged in, prepare DB updates first
      if (user) {
        const dbUpdates: any = { ...updates };

        if ('isPublic' in dbUpdates) {
          dbUpdates.is_public = dbUpdates.isPublic;
          // delete dbUpdates.isPublic; // Keep isPublic for local store
        }
        
        // Sync generatedImage and image_url
        if ('generatedImage' in dbUpdates) {
          dbUpdates.image_url = dbUpdates.generatedImage;
        } else if ('image_url' in dbUpdates) { // Ensure generatedImage is also synced if only image_url is passed
          dbUpdates.generatedImage = dbUpdates.image_url;
        }

        // Remove fields that don't exist in the database or shouldn't be client-updated directly
        const disallowedFields = ['commentCount', 'likeCount', 'audioUrl', 'isPublic', 'userId']; // userId is for local, user_id for db
        disallowedFields.forEach(field => {
          if (field in dbUpdates) delete dbUpdates[field];
        });
        
        console.log("Updating dream in database:", id, "with updates:", dbUpdates);
        
        const { error } = await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id); // Ensure user owns the dream
          
        if (error) {
          console.error("Database update error:", error);
          toast.error("Failed to update dream in database: " + error.message);
          return false; // Indicate failure
        }
      }
      
      // Update local store after successful DB update or if no user (local only mode)
      updateEntry(id, updates); // updates contains the client-side field names like isPublic

      if (updates.is_public === true || updates.isPublic === true) { // Check boolean true explicitly
        toast.success("Dream shared to Lucid Repo!");
      } else if (updates.is_public === false || updates.isPublic === false) { // Check boolean false explicitly
        toast.success("Dream set to private.");
      } else {
        toast.success("Dream updated successfully");
      }
      
      return true; // Indicate success
    } catch (error: any) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream: " + error.message);
      return false; // Indicate failure
    }
  };

  const handleDeleteDream = async (id: string) => {
    try {
      console.log("Deleting dream:", id);
      
      if (user) {
        const { data: dreamToDeleteData, error: fetchError } = await supabase
          .from("dream_entries")
          .select("generatedImage")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: 0 rows
             console.error("Error fetching dream before delete:", fetchError);
             // Potentially stop deletion if we can't confirm ownership or image path
        }

        if (dreamToDeleteData?.generatedImage && dreamToDeleteData.generatedImage.includes(supabase.storage.url) && dreamToDeleteData.generatedImage.includes("/dream-images/")) {
          try {
            const urlParts = dreamToDeleteData.generatedImage.split('/dream-images/');
            if (urlParts.length > 1) {
                const imagePath = urlParts[1];
                console.log("Deleting associated image from Supabase storage:", imagePath);
                await supabase.storage
                    .from("dream-images")
                    .remove([imagePath]);
                console.log("Deleted associated image:", imagePath);
            }
          } catch (imageError: any) {
            console.error("Error deleting image from storage:", imageError.message);
            // Continue with dream entry deletion even if image removal fails, but log it
          }
        }
        
        const { error: deleteError } = await supabase
          .from("dream_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
          
        if (deleteError) {
          console.error("Database deletion error:", deleteError);
          toast.error("Failed to delete dream from database: " + deleteError.message);
          return false;
        }
        
        await supabase.from("dream_likes").delete().eq("dream_id", id);
        await supabase.from("dream_comments").delete().eq("dream_id", id);
      }
      
      deleteEntry(id);
      toast.success("Dream deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream: " + error.message);
      return false;
    }
  };

  const handleTogglePublic = async (dream: DreamEntry) => {
    const newStatus = !(dream.is_public ?? dream.isPublic ?? false); // Default to false if undefined
    try {
      // Pass both is_public (for DB) and isPublic (for local store consistency if needed)
      const success = await handleUpdateDream(dream.id, { 
        is_public: newStatus, 
        isPublic: newStatus 
      }); 
      
      // Toasts are handled by handleUpdateDream based on these flags
      return success;
    } catch (error: any) {
      console.error("Error toggling dream visibility:", error);
      toast.error("Failed to update dream visibility: " + error.message);
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

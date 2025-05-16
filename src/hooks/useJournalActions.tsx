import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { toast } from "sonner";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamDbActions } from "./useDreamDbActions";
import { useDreamImageManager } from "./useDreamImageManager";

export const useJournalActions = () => {
  const { addEntry, updateEntry, deleteEntry } = useDreamStore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dreamDbActions = useDreamDbActions();
  const dreamImageManager = useDreamImageManager();

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
    if (!user) {
      toast.error("You must be logged in to save a dream.");
      setIsSubmitting(false);
      return;
    }

    try {
      const newDreamForStore = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
        user_id: user.id,
      });
      console.log("Adding dream locally with ID:", newDreamForStore.id);

      let finalImageUrl = dreamData.generatedImage;
      let finalDataUrl = null;
      if (dreamData.generatedImage) {
        console.log("Processing generated image for new dream:", dreamData.generatedImage);
        const uploadedUrl = await dreamImageManager.uploadAndLinkImage(newDreamForStore.id, dreamData.generatedImage, user.id);
        if (uploadedUrl && uploadedUrl !== dreamData.generatedImage) {
          finalImageUrl = uploadedUrl;
          console.log("Final image URL for new dream:", finalImageUrl);
        } else {
          // Failed upload: fallback to dataURL for persistence
          const { fetchImageAsDataURL } = await import("@/utils/persistDreamImage");
          finalDataUrl = await fetchImageAsDataURL(dreamData.generatedImage);
          if (finalDataUrl && finalDataUrl.startsWith("data:image/")) {
            toast.warning("Permanent image storage failed, saved as local backup.");
          } else {
            toast.warning("Image was generated but failed to save permanently. It might be temporary.");
          }
        }
      }
      
      const dreamForDb = {
        id: newDreamForStore.id,
        user_id: user.id,
        title: newDreamForStore.title,
        content: newDreamForStore.content,
        tags: dreamData.tags,
        mood: dreamData.mood,
        lucid: dreamData.lucid,
        date: newDreamForStore.date,
        is_public: false, // Default for new dreams
        analysis: dreamData.analysis || null,
        generatedImage: finalImageUrl || null,
        image_url: finalImageUrl || null,
        image_dataurl: finalDataUrl || null,
        imagePrompt: dreamData.imagePrompt || null,
      };
      
      console.log("Saving dream to database:", dreamForDb);
      const { error } = await dreamDbActions.addDreamToDb(dreamForDb);
          
      if (error) {
        console.error("Database error on insert:", error);
        toast.error("Error saving dream to database: " + error.message);
        throw error; 
      }
      
      if (finalImageUrl !== dreamData.generatedImage) {
        updateEntry(newDreamForStore.id, { generatedImage: finalImageUrl, image_url: finalImageUrl });
      }
      if (finalDataUrl) {
        updateEntry(newDreamForStore.id, { image_dataurl: finalDataUrl });
      }

      toast.success("Dream saved successfully!");
    } catch (error) {
      console.error("Error adding dream:", error);
      toast.error("Failed to save dream."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // Internal helper to manage updates (both DB and local store)
  const handleUpdateDreamInternal = async (id: string, updates: Partial<DreamEntry>): Promise<boolean> => {
    try {
      if (user) {
        // The `updates` object passed to `updateDreamInDb` should be curated
        // to only include fields relevant to the `dream_entries` table schema.
        // `useDreamDbActions.updateDreamInDb` already filters to allowed fields.
        const { error } = await dreamDbActions.updateDreamInDb(id, updates, user.id);
        
        if (error) {
          console.error("Database update error:", error);
          toast.error("Failed to update dream in database: " + error.message);
          return false; 
        }
      }
      
      // Update local store with all intended changes
      updateEntry(id, updates); 

      // Toasts based on update type
      if (updates.is_public === true || updates.isPublic === true) { 
        toast.success("Dream shared to Lucid Repo!");
      } else if (updates.is_public === false || updates.isPublic === false) { 
        toast.success("Dream set to private.");
      } else {
        // Only show generic success if not a public toggle, and if there were actual updates
        if (Object.keys(updates).length > 0 && !updates.hasOwnProperty('isPublic') && !updates.hasOwnProperty('is_public')) {
            toast.success("Dream updated successfully");
        }
      }
      return true; 
    } catch (error: any) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream: " + error.message);
      return false; 
    }
  };


  const handleEditDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string; 
    imagePrompt?: string;
    audioUrl?: string; // Not currently saved to DB in this structure
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
      let finalDataUrl = null;

      if (dreamData.generatedImage) {
        console.log("Processing generated/updated image for existing dream:", dreamData.generatedImage);
        const uploadedUrl = await dreamImageManager.uploadAndLinkImage(dreamId, dreamData.generatedImage, user.id);
        if (uploadedUrl && uploadedUrl !== dreamData.generatedImage) {
          finalImageUrl = uploadedUrl;
          console.log("Final image URL for edited dream:", finalImageUrl);
        } else {
          // Failed upload: fallback to dataURL for persistence
          const { fetchImageAsDataURL } = await import("@/utils/persistDreamImage");
          finalDataUrl = await fetchImageAsDataURL(dreamData.generatedImage);
          if (finalDataUrl && finalDataUrl.startsWith("data:image/")) {
            toast.warning("Permanent image storage failed, saved as local backup.");
          }
        }
      }
      
      const updates: Partial<DreamEntry> = {
        ...dreamData, // title, content, tags, lucid, mood, analysis, imagePrompt
        generatedImage: finalImageUrl, 
        image_url: finalImageUrl,
        image_dataurl: finalDataUrl,
      };
      
      await handleUpdateDreamInternal(dreamId, updates); 
    } catch (error) {
        console.error("Error editing dream:", error);
        toast.error("Failed to update dream.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteDream = async (id: string) => {
    setIsSubmitting(true); // Good to set submitting state here too
    try {
      console.log("Deleting dream:", id);
      
      let imageUrlToDelete: string | null | undefined = null;
      if (user) {
        const { data: dreamToDeleteData, error: fetchError } = await dreamDbActions.fetchDreamEntryForImageDeletion(id, user.id);
          
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found, which is fine if already deleted
             console.error("Error fetching dream before delete:", fetchError);
        }
        imageUrlToDelete = dreamToDeleteData?.generatedImage;
        
        // Delete from DB (also handles related likes/comments)
        const { error: deleteError } = await dreamDbActions.deleteDreamFromDb(id, user.id);
          
        if (deleteError) {
          console.error("Database deletion error:", deleteError);
          toast.error("Failed to delete dream from database: " + deleteError.message);
          setIsSubmitting(false);
          return false;
        }
      }
      
      // If DB deletion was successful (or no user for offline mode, though that's not handled here)
      // proceed to delete image from storage
      if (imageUrlToDelete) {
        await dreamImageManager.deleteManagedImage(imageUrlToDelete);
      }
      
      deleteEntry(id); // Delete from local store
      toast.success("Dream deleted successfully");
      setIsSubmitting(false);
      return true;
    } catch (error: any) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream: " + error.message);
      setIsSubmitting(false);
      return false;
    }
  };

  const handleTogglePublic = async (dream: DreamEntry) => {
    const newStatus = !(dream.is_public ?? dream.isPublic ?? false); 
    try {
      // Call the internal update helper
      const success = await handleUpdateDreamInternal(dream.id, { 
        is_public: newStatus, 
        isPublic: newStatus // Keep both for local store compatibility if needed
      });       
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
    handleEditDream, // Expose this refined version
    // handleUpdateDream, // This is now internal, not exposed directly unless needed
    handleDeleteDream,
    handleTogglePublic
  };
};

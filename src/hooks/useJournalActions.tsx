import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { toast } from "sonner";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamDbActions } from "./useDreamDbActions";
import { useDreamImageManager } from "./useDreamImageManager";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

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
      let imageUrl = "";

      // If the dream has a generated/selected image, upload it for persistence on Supabase
      if (dreamData.generatedImage && dreamData.generatedImage.startsWith("data:image/")) {
        const supabaseImageUrl = await uploadImageToSupabase(dreamData.generatedImage, user.id);
        if (supabaseImageUrl) {
          imageUrl = supabaseImageUrl;
        } else {
          throw new Error("Failed to upload image to Supabase storage.");
        }
      }

      const newDreamForStore = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
        user_id: user.id,
        generatedImage: imageUrl, // Save the public URL (or empty string)
        image_dataurl: imageUrl,
      });
      console.log("Adding dream locally with ID:", newDreamForStore.id);

      const dreamForDb = {
        id: newDreamForStore.id,
        user_id: user.id,
        title: newDreamForStore.title,
        content: newDreamForStore.content,
        tags: dreamData.tags,
        mood: dreamData.mood,
        lucid: dreamData.lucid,
        date: newDreamForStore.date,
        is_public: false,
        analysis: dreamData.analysis || null,
        generatedImage: imageUrl,
        image_url: imageUrl,
        image_dataurl: imageUrl,
        imagePrompt: dreamData.imagePrompt || null,
      };

      console.log("Saving dream to database with image:", dreamForDb);
      const { error } = await dreamDbActions.addDreamToDb(dreamForDb);

      if (error) {
        console.error("Database error on insert:", error);
        toast.error("Error saving dream to database: " + error.message);
        throw error;
      }

      updateEntry(newDreamForStore.id, { generatedImage: imageUrl, image_url: imageUrl, image_dataurl: imageUrl });
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
        // see if there's anything to actually update (not just detail open)
        const keysToUpdate = Object.keys(updates).filter(
          key => key !== "commentCount" && key !== "likeCount"
        );
        if (keysToUpdate.length === 0) {
          // No meaningful fields to update, skip toast/log for passive loads
          return true;
        }
        const { error } = await dreamDbActions.updateDreamInDb(id, updates, user.id);
        if (error) {
          // Only show toast for real update attempts (not on detail view)
          if (
            updates.hasOwnProperty('title') ||
            updates.hasOwnProperty('tags') ||
            updates.hasOwnProperty('content') ||
            updates.hasOwnProperty('generatedImage') ||
            updates.hasOwnProperty('imagePrompt') ||
            updates.hasOwnProperty('mood') ||
            updates.hasOwnProperty('lucid')
          ) {
            toast.error("Failed to update dream in database: " + error.message);
          }
          return false; 
        }
      }
      updateEntry(id, updates); 
      // Toasts based on update type
      if (updates.is_public === true || updates.isPublic === true) { 
        toast.success("Dream shared to Lucid Repo!");
      } else if (updates.is_public === false || updates.isPublic === false) { 
        toast.success("Dream set to private.");
      } else {
        // Only show a generic toast if it's a direct edit (never for passive loads)
        if (
          Object.keys(updates).length > 0 &&
          !updates.hasOwnProperty('isPublic') &&
          !updates.hasOwnProperty('is_public') &&
          (
            updates.hasOwnProperty('title') ||
            updates.hasOwnProperty('tags') ||
            updates.hasOwnProperty('content') ||
            updates.hasOwnProperty('generatedImage') ||
            updates.hasOwnProperty('imagePrompt') ||
            updates.hasOwnProperty('mood') ||
            updates.hasOwnProperty('lucid')
          )
        ) {
          toast.success("Dream updated successfully");
        }
      }
      return true; 
    } catch (error: any) {
      // Don't spam error toasts unless it was a real update
      if (
        updates.hasOwnProperty('title') ||
        updates.hasOwnProperty('tags') ||
        updates.hasOwnProperty('content') ||
        updates.hasOwnProperty('generatedImage') ||
        updates.hasOwnProperty('imagePrompt') ||
        updates.hasOwnProperty('mood') ||
        updates.hasOwnProperty('lucid')
      ) {
        toast.error("Failed to update dream: " + error.message);
      }
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
      let imageUrl = "";
      let shouldUpdateImage = false;

      // Check if a new image (base64) was provided, upload if needed
      if (dreamData.generatedImage && dreamData.generatedImage.startsWith("data:image/")) {
        console.log('[Dream Edit] Uploading base64 image to Supabase...');
        const supabaseImageUrl = await uploadImageToSupabase(dreamData.generatedImage, user.id, dreamId);
        if (supabaseImageUrl) {
          imageUrl = supabaseImageUrl;
          shouldUpdateImage = true;
          console.log('[Dream Edit] New image saved to:', imageUrl);
        } else {
          console.error("[Dream Edit] Failed upload, supabaseImageUrl is null");
          toast.error("Failed to persist image—please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (dreamData.generatedImage && (
        dreamData.generatedImage.startsWith("http")
        || dreamData.generatedImage.startsWith("https")
      )) {
        // Direct HTTP(S) URL provided (already persisted)
        imageUrl = dreamData.generatedImage;
        shouldUpdateImage = true;
        console.log('[Dream Edit] Using existing image URL:', imageUrl);
      }

      const updates: Partial<DreamEntry> = {
        ...dreamData,
        // If a new or existing image URL is present, set all related props
        ...(shouldUpdateImage
          ? {
              generatedImage: imageUrl,
              image_url: imageUrl,
              image_dataurl: imageUrl,
            }
          : {}
        ),
      };

      // Always stringify tags if not already a string[]
      if (Array.isArray(updates.tags) && typeof updates.tags[0] !== "string") {
        updates.tags = updates.tags.map((t: any) => (typeof t === "object" && t.id ? t.id : t));
      }

      console.log("[Dream Edit] Persisting updates:", updates);

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

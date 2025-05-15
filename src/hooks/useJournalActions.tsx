
import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
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
      const newDream = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
        user_id: user.id, 
      });

      console.log("Adding dream locally with ID:", newDream.id);

      let finalImageUrl = dreamData.generatedImage;

      if (dreamData.generatedImage) {
        console.log("Processing generated image for new dream:", dreamData.generatedImage);
        const uploadedUrl = await uploadDreamImage(newDream.id, dreamData.generatedImage, user.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log("Final image URL for new dream:", finalImageUrl);
        } else {
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
        generatedImage: finalImageUrl || null, 
        image_url: finalImageUrl || null, 
        imagePrompt: dreamData.imagePrompt || null
      };
      
      console.log("Saving dream to database:", dbSaveDream);
      const { error } = await supabase
        .from("dream_entries")
        .insert(dbSaveDream);
          
      if (error) {
        console.error("Database error on insert:", error);
        toast.error("Error saving dream to database: " + error.message);
        throw error; 
      }
      
      if (finalImageUrl !== dreamData.generatedImage) {
        updateEntry(newDream.id, { generatedImage: finalImageUrl, image_url: finalImageUrl });
      }

      toast.success("Dream saved successfully!");
      return; 
    } catch (error) {
      console.error("Error adding dream:", error);
      toast.error("Failed to save dream."); 
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
      let finalImageUrl = dreamData.generatedImage;

      if (dreamData.generatedImage) {
        console.log("Processing generated/updated image for existing dream:", dreamData.generatedImage);
        const uploadedUrl = await uploadDreamImage(dreamId, dreamData.generatedImage, user.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log("Final image URL for edited dream:", finalImageUrl);
        } else {
          toast.warning("Image update failed. Previous image (if any) will be kept or image may be temporary.");
        }
      }
      
      const updates = {
        ...dreamData,
        generatedImage: finalImageUrl, 
        image_url: finalImageUrl, 
      };
      
      await handleUpdateDream(dreamId, updates); 
    } catch (error) {
        console.error("Error editing dream:", error);
        toast.error("Failed to update dream.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDream = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      if (user) {
        const dbUpdates: any = { ...updates };

        if ('isPublic' in dbUpdates) {
          dbUpdates.is_public = dbUpdates.isPublic;
        }
        
        if ('generatedImage' in dbUpdates) {
          dbUpdates.image_url = dbUpdates.generatedImage;
        } else if ('image_url' in dbUpdates) { 
          dbUpdates.generatedImage = dbUpdates.image_url;
        }

        const disallowedFields = ['commentCount', 'likeCount', 'audioUrl', 'isPublic', 'userId']; 
        disallowedFields.forEach(field => {
          if (field in dbUpdates) delete dbUpdates[field];
        });
        
        console.log("Updating dream in database:", id, "with updates:", dbUpdates);
        
        const { error } = await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id); 
          
        if (error) {
          console.error("Database update error:", error);
          toast.error("Failed to update dream in database: " + error.message);
          return false; 
        }
      }
      
      updateEntry(id, updates); 

      if (updates.is_public === true || updates.isPublic === true) { 
        toast.success("Dream shared to Lucid Repo!");
      } else if (updates.is_public === false || updates.isPublic === false) { 
        toast.success("Dream set to private.");
      } else {
        toast.success("Dream updated successfully");
      }
      
      return true; 
    } catch (error: any) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream: " + error.message);
      return false; 
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
          
        if (fetchError && fetchError.code !== 'PGRST116') { 
             console.error("Error fetching dream before delete:", fetchError);
        }
        
        const baseSupabaseStorageUrl = `${SUPABASE_URL}/storage/v1/object/public/dream-images/`;
        if (dreamToDeleteData?.generatedImage && dreamToDeleteData.generatedImage.startsWith(baseSupabaseStorageUrl)) {
          try {
            // Extract path after /dream-images/
            const imagePath = dreamToDeleteData.generatedImage.substring(baseSupabaseStorageUrl.length);
            if (imagePath) {
                console.log("Deleting associated image from Supabase storage:", imagePath);
                await supabase.storage
                    .from("dream-images")
                    .remove([imagePath]);
                console.log("Deleted associated image:", imagePath);
            }
          } catch (imageError: any) {
            console.error("Error deleting image from storage:", imageError.message);
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
    const newStatus = !(dream.is_public ?? dream.isPublic ?? false); 
    try {
      const success = await handleUpdateDream(dream.id, { 
        is_public: newStatus, 
        isPublic: newStatus 
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
    handleEditDream,
    handleUpdateDream,
    handleDeleteDream,
    handleTogglePublic
  };
};


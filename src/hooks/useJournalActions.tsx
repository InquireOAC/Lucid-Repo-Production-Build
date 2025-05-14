import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";

export const useJournalActions = () => {
  const { addEntry, updateEntry, deleteEntry } = useDreamStore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to upload image to Supabase storage
  const uploadImageToStorage = async (imageUrl: string, dreamId: string): Promise<string | null> => {
    if (!imageUrl || !dreamId) return null;

    try {
      // If it's already a Supabase URL, return it
      if (imageUrl.includes("supabase.co") && imageUrl.includes("/storage/v1/object/public/")) {
        return imageUrl;
      }

      // Otherwise, fetch the image and upload to Supabase
      console.log("Uploading image to Supabase storage:", dreamId);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a unique path for the image
      const filePath = `dream_${dreamId}_${new Date().getTime()}.png`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("dream_images")
        .upload(filePath, blob, {
          contentType: "image/png",
          upsert: true
        });

      if (error) {
        console.error("Error uploading to Supabase storage:", error);
        return imageUrl; // Return original URL as fallback
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("dream_images")
        .getPublicUrl(filePath);

      console.log("Image uploaded successfully:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error in image upload process:", error);
      return imageUrl; // Return original URL as fallback
    }
  };

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
          storedImageUrl = await uploadImageToStorage(dreamData.generatedImage, newDream.id);
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
          generatedImage: storedImageUrl || null,
          image_url: storedImageUrl || null, // Also save to image_url
          imagePrompt: dreamData.imagePrompt || null,
          image_prompt: dreamData.imagePrompt || null, // Also save to image_prompt
          audio_url: dreamData.audioUrl || null
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
        storedImageUrl = await uploadImageToStorage(dreamData.generatedImage, dreamId);
      }
      
      // Update with the stored image URL
      const updates = {
        ...dreamData,
        generatedImage: storedImageUrl,
        image_url: storedImageUrl
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
        
        if ('generatedImage' in dbUpdates) {
          dbUpdates.image_url = dbUpdates.generatedImage;
        }
        
        if ('imagePrompt' in dbUpdates) {
          dbUpdates.image_prompt = dbUpdates.imagePrompt;
        }
        
        // Remove fields that don't exist in the database
        if ('commentCount' in dbUpdates) {
          dbUpdates.comment_count = dbUpdates.commentCount;
          delete dbUpdates.commentCount;
        }
        
        if ('likeCount' in dbUpdates) {
          dbUpdates.like_count = dbUpdates.likeCount;
          delete dbUpdates.likeCount;
        }
        
        if ('audioUrl' in dbUpdates) {
          dbUpdates.audio_url = dbUpdates.audioUrl;
          delete dbUpdates.audioUrl;
        }
        
        console.log("Updating dream in database:", id);
        
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
        const { data: dreamData } = await supabase
          .from("dream_entries")
          .select("generatedImage, image_url")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
          
        // Delete from database first
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
        
        // Delete associated image if it exists
        const imageUrl = dreamData?.generatedImage || dreamData?.image_url;
        if (imageUrl && imageUrl.includes("supabase.co") && imageUrl.includes("/storage/v1/object/public/dream_images/")) {
          try {
            // Extract the path from the URL
            const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/dream_images\/(.+)/);
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

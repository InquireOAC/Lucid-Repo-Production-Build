
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
          generatedImage: dreamData.generatedImage || null,
          image_url: dreamData.generatedImage || null, // Also save to image_url
          imagePrompt: dreamData.imagePrompt || null,
          image_prompt: dreamData.imagePrompt || null, // Also save to image_prompt
          audio_url: dreamData.audioUrl || null
        };
        
        const { error } = await supabase
          .from("dream_entries")
          .insert(dbSaveDream);
          
        if (error) {
          console.error("Database error:", error);
        }
      }
      toast("Dream saved successfully!");
    } catch (error) {
      console.error("Error adding dream:", error);
      toast("Failed to save dream");
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
  }): Promise<void> => {
    if (!dreamData) return;
    setIsSubmitting(true);
    try {
      // We need dreamId but it's not in the parameter
      // This is a mismatch with how it's used in Journal.tsx
      console.error("Error: dreamId is required but not provided in handleEditDream");
      toast("Failed to update dream: Missing dream ID");
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
        
        await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id);
      }
      
      if (updates.is_public || updates.isPublic) {
        toast("Dream shared to Lucid Repo!");
      }
      
      return true;
    } catch (error) {
      console.error("Error updating dream:", error);
      return false;
    }
  };

  const handleDeleteDream = async (id: string) => {
    try {
      console.log("Deleting dream:", id);
      
      // If user is logged in, delete from database first
      if (user) {
        const { error } = await supabase
          .from("dream_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Database deletion error:", error);
          toast("Failed to delete dream from database");
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
      toast("Dream deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast("Failed to delete dream");
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
        toast("Dream published to Lucid Repo");
      } else {
        toast("Dream set to private");
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

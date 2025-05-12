
import { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";

export const useDreamJournal = () => {
  const { entries, tags, addEntry, updateEntry, deleteEntry } = useDreamStore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingDream, setIsAddingDream] = useState(false);
  const [isEditingDream, setIsEditingDream] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [dreamToDelete, setDreamToDelete] = useState<string | null>(null);
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);

  // When the user is logged in, sync their dreams from the database
  useEffect(() => {
    if (user) {
      syncDreamsFromDb();
    }
  }, [user]);

  const syncDreamsFromDb = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert the database dreams to the local format and merge
      if (data && data.length > 0) {
        const formattedDreams = data.map((dream: any) => ({
          id: dream.id,
          date: dream.date,
          title: dream.title,
          content: dream.content,
          tags: dream.tags || [],
          mood: dream.mood,
          lucid: dream.lucid || false,
          imagePrompt: dream.imagePrompt || dream.image_prompt,
          generatedImage: dream.generatedImage || dream.image_url, // Support both field names
          image_url: dream.image_url || dream.generatedImage, // Add image_url for database compatibility
          analysis: dream.analysis,
          is_public: dream.is_public || false,
          isPublic: dream.is_public || false,
          like_count: dream.like_count || 0,
          likeCount: dream.like_count || 0,
          comment_count: dream.comment_count || 0,
          commentCount: dream.comment_count || 0,
          user_id: dream.user_id
        }));
        
        console.log("Synced dreams with images:", formattedDreams.map(d => ({
          id: d.id,
          title: d.title,
          hasImage: Boolean(d.generatedImage || d.image_url)
        })));
        
        // Update the local store with dreams from the database
        formattedDreams.forEach(dream => {
          updateEntry(dream.id, dream);
        });
      }
    } catch (error) {
      console.error("Error syncing dreams from database:", error);
    }
  };

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
  }) => {
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
        };
        
        const { error } = await supabase
          .from("dream_entries")
          .insert(dbSaveDream);
          
        if (error) {
          console.error("Database error:", error);
          throw error;
        }
      }
      setIsAddingDream(false);
      toast.success("Dream saved successfully!");
    } catch (error) {
      console.error("Error adding dream:", error);
      toast.error("Failed to save dream");
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
  }) => {
    if (!selectedDream) return;
    setIsSubmitting(true);
    try {
      // Prepare the update with both field names for database compatibility
      const updateData = {
        ...dreamData,
        analysis: dreamData.analysis || selectedDream.analysis || null,
        generatedImage: dreamData.generatedImage || selectedDream.generatedImage || null,
        image_url: dreamData.generatedImage || selectedDream.generatedImage || null,
        imagePrompt: dreamData.imagePrompt || selectedDream.imagePrompt || null,
      };
      
      // Update local store
      updateEntry(selectedDream.id, updateData);

      console.log("Updating dream with:", {
        id: selectedDream.id,
        analysis: Boolean(updateData.analysis),
        generatedImage: Boolean(updateData.generatedImage),
        imagePrompt: Boolean(updateData.imagePrompt)
      });

      // If user is logged in, also update in database
      if (user) {
        // Create a database-safe update object (excluding any fields not in the schema)
        const dbUpdateData = {
          title: dreamData.title,
          content: dreamData.content,
          tags: dreamData.tags,
          mood: dreamData.mood,
          lucid: dreamData.lucid,
          analysis: updateData.analysis,
          generatedImage: updateData.generatedImage,
          image_url: updateData.image_url,
          imagePrompt: updateData.imagePrompt,
          updated_at: new Date().toISOString()
        };

        // Remove fields that aren't in the database schema
        const cleanedDbData = Object.keys(dbUpdateData).reduce((acc, key) => {
          if (!['imagePrompt', 'image_prompt'].includes(key)) {
            acc[key] = dbUpdateData[key];
          }
          return acc;
        }, {} as Record<string, any>);
          
        const { error } = await supabase
          .from("dream_entries")
          .update(cleanedDbData)
          .eq("id", selectedDream.id)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Database error:", error);
          throw error;
        }
      }
      setIsEditingDream(false);
      setSelectedDream(null);
      toast.success("Dream updated successfully!");
    } catch (error) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream");
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
        
        if ('audioUrl' in dbUpdates) {
          delete dbUpdates.audioUrl;  // Remove this field as it doesn't exist in DB
        }
        
        if ('audio_url' in dbUpdates) {
          delete dbUpdates.audio_url;  // Remove this field as it doesn't exist in DB
        }
        
        console.log("Updating dream in database:", id, {
          has_image: Boolean(dbUpdates.generatedImage || dbUpdates.image_url)
        });
        
        const { error } = await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) {
          console.error("Database error:", error);
          throw error;
        }
      }
      if (updates.is_public || updates.isPublic) {
        toast.success("Dream shared to Lucid Repo!");
      }
    } catch (error) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream");
    }
  };

  const handleDeleteDream = async (id: string) => {
    try {
      // Delete from local store
      deleteEntry(id);

      // If user is logged in, also delete from database
      if (user) {
        const { error } = await supabase
          .from("dream_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Database error:", error);
          // Don't throw error here or toast error
          // The deletion is still applied in local storage
        }
      }
      setSelectedDream(null);
      setDreamToDelete(null);
      toast.success("Dream deleted successfully");
    } catch (error) {
      console.error("Error deleting dream:", error);
      // Don't show error toast as the dream is deleted in local storage
    }
  };

  const handleTogglePublic = async (dream: DreamEntry) => {
    const newStatus = !(dream.is_public || dream.isPublic);
    try {
      await handleUpdateDream(dream.id, {
        is_public: newStatus,
        isPublic: newStatus
      });
      
      // Successfully toggled in local storage
      if (newStatus) {
        toast.success("Dream published to Lucid Repo");
      } else {
        toast.success("Dream set to private");
      }
    } catch (error) {
      console.error("Error toggling dream visibility:", error);
      // Error is already handled in handleUpdateDream
    }
  };

  const handleTagClick = (tagId: string) => {
    setActiveTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Filter dreams by active tags
  const filteredDreams =
    activeTagIds.length > 0
      ? entries.filter((dream) =>
          dream.tags.some((tagId) => activeTagIds.includes(tagId))
        )
      : entries;

  // Get unique tags used in dreams for display in filter bar
  const uniqueTagsInDreams = tags.filter((tag) =>
    entries.some((dream) => dream.tags.includes(tag.id))
  );

  return {
    entries,
    filteredDreams,
    tags,
    uniqueTagsInDreams,
    activeTagIds,
    isSubmitting,
    isAddingDream,
    setIsAddingDream,
    isEditingDream,
    setIsEditingDream,
    selectedDream,
    setSelectedDream,
    dreamToDelete,
    setDreamToDelete,
    handleAddDream,
    handleEditDream,
    handleUpdateDream,
    handleDeleteDream,
    handleTogglePublic,
    handleTagClick,
    setActiveTagIds,
    user,
    syncDreamsFromDb
  };
};

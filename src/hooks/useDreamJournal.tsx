
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
          generatedImage: dream.generatedImage || dream.image_url,
          analysis: dream.analysis,
          is_public: dream.is_public || false,
          isPublic: dream.is_public || false,
          like_count: dream.like_count || 0,
          likeCount: dream.like_count || 0,
          comment_count: dream.comment_count || 0,
          commentCount: dream.comment_count || 0,
          audioUrl: dream.audio_url,
          audio_url: dream.audio_url,
          user_id: dream.user_id
        }));
        
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
    audioUrl?: string;
  }) => {
    setIsSubmitting(true);
    try {
      // First add to local store
      const newDream = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
        audioUrl: dreamData.audioUrl || null
      });

      console.log("Adding dream with audio:", dreamData.audioUrl);

      // If user is logged in, also save to database
      if (user) {
        const { error } = await supabase
          .from("dream_entries")
          .insert({
            id: newDream.id,
            user_id: user.id,
            title: newDream.title,
            content: newDream.content,
            tags: dreamData.tags,
            mood: dreamData.mood,
            lucid: dreamData.lucid,
            date: newDream.date,
            is_public: false,
            audio_url: dreamData.audioUrl || null // Save audio URL to database
          });
        if (error) throw error;
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
    audioUrl?: string;
  }) => {
    if (!selectedDream) return;
    setIsSubmitting(true);
    try {
      // Update local store
      updateEntry(selectedDream.id, {
        ...dreamData,
        audioUrl: dreamData.audioUrl || null
      });

      console.log("Updating dream with audio:", dreamData.audioUrl);

      // If user is logged in, also update in database
      if (user) {
        const { error } = await supabase
          .from("dream_entries")
          .update({
            title: dreamData.title,
            content: dreamData.content,
            tags: dreamData.tags,
            mood: dreamData.mood,
            lucid: dreamData.lucid,
            audio_url: dreamData.audioUrl || null, // Update audio URL in database
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedDream.id)
          .eq("user_id", user.id);
        if (error) throw error;
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

        // Remove isPublic from database updates and use is_public instead
        if ('isPublic' in dbUpdates) {
          dbUpdates.is_public = dbUpdates.isPublic;
          delete dbUpdates.isPublic;
        }
        
        // Convert audioUrl to audio_url for database
        if ('audioUrl' in dbUpdates) {
          dbUpdates.audio_url = dbUpdates.audioUrl;
          delete dbUpdates.audioUrl;
        }
        
        console.log("Updating dream in database:", id, dbUpdates);
        
        const { error } = await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Database error:", error);
          toast.error("Failed to update dream in database");
        } else if (updates.is_public || updates.isPublic) {
          toast.success("Dream shared to Lucid Repo!");
          // Trigger an immediate refetch since we made this public
          syncDreamsFromDb();
        }
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
        if (error) throw error;
      }
      setSelectedDream(null);
      setDreamToDelete(null);
      toast.success("Dream deleted successfully");
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
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
    } catch (error) {
      console.error("Error toggling dream visibility:", error);
      toast.error("Failed to update dream visibility");
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

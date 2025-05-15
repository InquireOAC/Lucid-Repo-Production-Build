
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

export const useDreamDbActions = () => {
  const addDreamToDb = async (
    dreamData: Pick<
      DreamEntry,
      | "id"
      | "user_id"
      | "title"
      | "content"
      | "tags"
      | "mood"
      | "lucid"
      | "date"
      | "analysis"
      | "generatedImage"
      | "image_url"
      | "imagePrompt"
    > & { is_public?: boolean }
  ) => {
    const dbSaveDream = {
      id: dreamData.id,
      user_id: dreamData.user_id,
      title: dreamData.title,
      content: dreamData.content,
      tags: dreamData.tags,
      mood: dreamData.mood,
      lucid: dreamData.lucid,
      date: dreamData.date,
      is_public: dreamData.is_public || false,
      analysis: dreamData.analysis || null,
      generatedImage: dreamData.generatedImage || null,
      image_url: dreamData.image_url || null,
      imagePrompt: dreamData.imagePrompt || null,
    };
    return supabase.from("dream_entries").insert(dbSaveDream);
  };

  const updateDreamInDb = async (
    dreamId: string,
    updates: Partial<DreamEntry>,
    userId: string
  ) => {
    const dbUpdates: Partial<any> = {}; // Prepare a clean object for DB
    const allowedFields: (keyof DreamEntry)[] = [
      "title", "content", "tags", "mood", "lucid", "analysis",
      "generatedImage", "image_url", "imagePrompt", "is_public"
    ];

    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        (dbUpdates as any)[field] = updates[field];
      }
    });
    
    // Handle specific mappings if necessary (e.g., isPublic to is_public)
    if (updates.hasOwnProperty('isPublic')) {
        dbUpdates.is_public = updates.isPublic;
    }
    
    // Ensure image_url and generatedImage are consistent if one is provided
    if (updates.generatedImage && !updates.image_url) {
        dbUpdates.image_url = updates.generatedImage;
    } else if (updates.image_url && !updates.generatedImage) {
        dbUpdates.generatedImage = updates.image_url;
    }


    if (Object.keys(dbUpdates).length === 0) {
      // Avoid making an update call if there's nothing to update.
      // This can happen if 'updates' contained only fields not in 'allowedFields'.
      return { data: null, error: null }; 
    }

    return supabase
      .from("dream_entries")
      .update(dbUpdates)
      .eq("id", dreamId)
      .eq("user_id", userId);
  };

  const deleteDreamFromDb = async (dreamId: string, userId: string) => {
    // First, delete related entries (likes, comments)
    await supabase.from("dream_likes").delete().eq("dream_id", dreamId);
    await supabase.from("dream_comments").delete().eq("dream_id", dreamId);
    
    // Then, delete the dream entry itself
    return supabase
      .from("dream_entries")
      .delete()
      .eq("id", dreamId)
      .eq("user_id", userId);
  };

  const fetchDreamEntryForImageDeletion = async (dreamId: string, userId: string) => {
    return supabase
      .from("dream_entries")
      .select("generatedImage")
      .eq("id", dreamId)
      .eq("user_id", userId)
      .single();
  };

  return { addDreamToDb, updateDreamInDb, deleteDreamFromDb, fetchDreamEntryForImageDeletion };
};

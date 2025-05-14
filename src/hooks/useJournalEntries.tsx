
import { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";
import { persistImageURL } from "@/utils/imageUtils";

export const useJournalEntries = () => {
  const { entries, updateEntry } = useDreamStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const syncDreamsFromDb = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert the database dreams to the local format and merge
      if (data && data.length > 0) {
        const formattedDreams = await Promise.all(data.map(async (dream: any) => {
          // Try to create a persistent blob URL for the image if it exists
          let persistentImageUrl = dream.generatedImage || dream.image_url;
          if (persistentImageUrl) {
            try {
              persistentImageUrl = await persistImageURL(persistentImageUrl);
            } catch (e) {
              console.error("Error persisting image URL:", e);
            }
          }
          
          return {
            id: dream.id,
            date: dream.date,
            title: dream.title,
            content: dream.content,
            tags: dream.tags || [],
            mood: dream.mood,
            lucid: dream.lucid || false,
            imagePrompt: dream.imagePrompt || dream.image_prompt,
            generatedImage: persistentImageUrl,
            image_url: persistentImageUrl, // Support both field names
            analysis: dream.analysis,
            is_public: dream.is_public || false,
            isPublic: dream.is_public || false,
            like_count: dream.like_count || 0,
            likeCount: dream.like_count || 0,
            comment_count: dream.comment_count || 0,
            commentCount: dream.comment_count || 0,
            user_id: dream.user_id,
            audioUrl: dream.audio_url
          };
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
    } finally {
      setIsLoading(false);
    }
  };

  // When user is logged in, sync dreams from DB
  useEffect(() => {
    if (user) {
      syncDreamsFromDb();
    }
  }, [user]);

  return {
    entries,
    isLoading,
    syncDreamsFromDb
  };
};

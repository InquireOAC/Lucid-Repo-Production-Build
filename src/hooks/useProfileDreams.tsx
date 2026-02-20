
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

export function useProfileDreams(user: any, userId?: string) {
  const [publicDreams, setPublicDreams] = useState<DreamEntry[]>([]);
  const [likedDreams, setLikedDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPublicDreams = async () => {
    const targetUserId = userId || user?.id;
    if (!targetUserId || !/^[0-9a-fA-F-]{36}$/.test(targetUserId)) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("dream_entries")
        // Add avatar_symbol and avatar_color to the select
        .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
        .eq("user_id", targetUserId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedDreams = data?.map((dream: any) => ({
        ...dream,
        isPublic: dream.is_public,
        likeCount: dream.like_count || 0,
        commentCount: dream.comment_count || 0,
        userId: dream.user_id,
        audioUrl: dream.audio_url,
        audio_url: dream.audio_url,
        profiles: dream.profiles
      }));

      setPublicDreams(transformedDreams || []);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikedDreams = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const targetUserId = userId || user.id;
      if (!/^[0-9a-fA-F-]{36}$/.test(targetUserId)) return;

      // Get liked dream IDs
      const { data: likedData, error: likedError } = await supabase
        .from("dream_likes")
        .select("dream_id")
        .eq("user_id", targetUserId);

      if (likedError) throw likedError;

      if (likedData && likedData.length > 0) {
        const dreamIds = likedData.map(item => item.dream_id);

        const { data: dreamData, error: dreamError } = await supabase
          .from("dream_entries")
          // Add avatar_symbol and avatar_color to the select
          .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
          .in("id", dreamIds)
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (dreamError) throw dreamError;

        const transformedDreams = dreamData?.map((dream: any) => ({
          ...dream,
          isPublic: dream.is_public,
          likeCount: dream.like_count || 0,
          commentCount: dream.comment_count || 0,
          userId: dream.user_id,
          audioUrl: dream.audio_url,
          audio_url: dream.audio_url,
          profiles: dream.profiles
        }));

        setLikedDreams(transformedDreams || []);
      } else {
        setLikedDreams([]);
      }
    } catch (error) {
      console.error("Error fetching liked dreams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDreams = () => {
    fetchPublicDreams();
    fetchLikedDreams();
  };

  useEffect(() => {
    fetchPublicDreams();
    fetchLikedDreams();
  }, [user, userId]);

  return {
    publicDreams,
    likedDreams,
    isLoading,
    fetchPublicDreams,
    fetchLikedDreams,
    refreshDreams
  };
}

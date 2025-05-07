
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

export function useProfileDreams(user: any, userId?: string) {
  const [publicDreams, setPublicDreams] = useState<DreamEntry[]>([]);
  const [likedDreams, setLikedDreams] = useState<DreamEntry[]>([]);

  const fetchPublicDreams = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map Supabase field names to our app's field names for consistency
      const transformedDreams = data.map((dream: any) => ({
        ...dream,
        isPublic: dream.is_public,
        likeCount: dream.like_count || 0,
        commentCount: dream.comment_count || 0, 
        userId: dream.user_id,
        profiles: dream.profiles
      }));
      
      setPublicDreams(transformedDreams || []);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    }
  };
  
  const fetchLikedDreams = async () => {
    if (!user) return;
    
    try {
      // For viewing own profile or someone else's
      const targetUserId = userId || user.id;
      
      // First get the liked dream IDs
      const { data: likedData, error: likedError } = await supabase
        .from("dream_likes")
        .select("dream_id")
        .eq("user_id", targetUserId);
      
      if (likedError) throw likedError;
      
      if (likedData && likedData.length > 0) {
        const dreamIds = likedData.map(item => item.dream_id);
        
        // Then fetch the actual dreams
        const { data: dreamData, error: dreamError } = await supabase
          .from("dream_entries")
          .select("*, profiles:user_id(username, display_name, avatar_url)")
          .in("id", dreamIds)
          .eq("is_public", true)
          .order("created_at", { ascending: false });
        
        if (dreamError) throw dreamError;
        
        // Map fields for consistency
        const transformedDreams = dreamData?.map((dream: any) => ({
          ...dream,
          isPublic: dream.is_public,
          likeCount: dream.like_count || 0,
          commentCount: dream.comment_count || 0,
          userId: dream.user_id,
          profiles: dream.profiles
        }));
        
        setLikedDreams(transformedDreams || []);
      } else {
        setLikedDreams([]);
      }
    } catch (error) {
      console.error("Error fetching liked dreams:", error);
    }
  };
  
  return {
    publicDreams,
    likedDreams,
    fetchPublicDreams,
    fetchLikedDreams
  };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

interface DiscoveryData {
  featured: DreamEntry | null;
  trending: DreamEntry[];
  following: DreamEntry[];
  newReleases: DreamEntry[];
  tagSections: { tag: string; dreams: DreamEntry[] }[];
  isLoading: boolean;
  refetch: () => void;
}

async function enrichDreams(dreamsRaw: any[], userId?: string): Promise<DreamEntry[]> {
  // Use the denormalized like_count/comment_count columns (trigger-maintained)
  // and resolve the current user's likes in ONE batched query, instead of the
  // previous per-dream count queries (an N+1 over up to 100 dreams).
  const ids = dreamsRaw.map((d: any) => d.id);
  let likedSet = new Set<string>();
  if (userId && ids.length) {
    const { data: myLikes } = await supabase
      .from("dream_likes")
      .select("dream_id")
      .eq("user_id", userId)
      .in("dream_id", ids);
    likedSet = new Set((myLikes || []).map((r: any) => r.dream_id));
  }

  return dreamsRaw.map((dream: any) => ({
    ...dream,
    isPublic: dream.is_public,
    like_count: dream.like_count || 0,
    likeCount: dream.like_count || 0,
    comment_count: dream.comment_count || 0,
    commentCount: dream.comment_count || 0,
    liked: likedSet.has(dream.id),
    userId: dream.user_id,
    profiles: dream.profiles,
    generatedImage: dream.generatedImage || dream.image_url || null,
    image_url: dream.image_url || dream.generatedImage || null,
    audio_url: dream.audio_url || null,
    video_url: dream.video_url || null,
  } as DreamEntry));
}

const TAG_SECTIONS = ["Lucid", "Nightmare", "Recurring", "Adventure", "Spiritual"];

export function useDiscoveryDreams(user: any): DiscoveryData {
  const [allDreams, setAllDreams] = useState<DreamEntry[]>([]);
  const [followingDreams, setFollowingDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      // Fetch all public dreams
      const { data: dreamsRaw } = await supabase
        .from("dream_entries")
        .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(100);

      const enriched = await enrichDreams(dreamsRaw || [], user?.id);
      setAllDreams(enriched);

      // Fetch following dreams
      if (user) {
        const { data: following } = await supabase
          .from("follows")
          .select("followed_id")
          .eq("follower_id", user.id);
        const followedIds = following?.map(r => r.followed_id) || [];

        if (followedIds.length > 0) {
          const { data: fDreams } = await supabase
            .from("dream_entries")
            .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
            .eq("is_public", true)
            .in("user_id", followedIds)
            .order("created_at", { ascending: false })
            .limit(20);
          const fEnriched = await enrichDreams(fDreams || [], user.id);
          setFollowingDreams(fEnriched);
        }
      }
    } catch (e) {
      console.error("Discovery fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user]);

  // Derive sections
  const dreamsWithImages = allDreams.filter(d => d.generatedImage || d.image_url);

  // Featured: highest engagement dream with image
  const featured = dreamsWithImages.length > 0
    ? [...dreamsWithImages].sort((a, b) => 
        ((b.like_count || 0) + (b.comment_count || 0)) - ((a.like_count || 0) + (a.comment_count || 0))
      )[0]
    : null;

  // Trending: most likes in recent dreams (exclude featured)
  const trending = [...allDreams]
    .filter(d => d.id !== featured?.id)
    .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    .slice(0, 15);

  // New releases: most recent (exclude featured)
  const newReleases = allDreams
    .filter(d => d.id !== featured?.id)
    .slice(0, 15);

  // Tag sections
  const tagSections = TAG_SECTIONS.map(tag => ({
    tag,
    dreams: allDreams.filter(d => d.tags?.some(t => t.toLowerCase() === tag.toLowerCase())).slice(0, 15),
  })).filter(s => s.dreams.length > 0);

  return {
    featured,
    trending,
    following: followingDreams,
    newReleases,
    tagSections,
    isLoading,
    refetch: fetchAll,
  };
}

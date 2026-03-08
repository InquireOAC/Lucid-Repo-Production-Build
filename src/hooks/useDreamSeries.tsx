import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DreamSeries {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  tags: string[];
  is_public: boolean;
  status: string;
  like_count: number;
  view_count: number;
  chapter_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    avatar_symbol?: string;
    avatar_color?: string;
  };
}

export interface SeriesChapter {
  id: string;
  series_id: string;
  dream_id: string;
  chapter_number: number;
  created_at: string;
  dream?: any;
}

export function useDreamSeries(userId?: string) {
  const [series, setSeries] = useState<DreamSeries[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserSeries = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_series")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setSeries(data || []);
    } catch (e) {
      console.error("Error fetching user series:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUserSeries(); }, [fetchUserSeries]);

  const createSeries = async (data: {
    title: string;
    description?: string;
    cover_image_url?: string;
    tags?: string[];
    is_public?: boolean;
  }) => {
    if (!userId) return null;
    try {
      const { data: created, error } = await supabase
        .from("dream_series")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      toast.success("Series created!");
      fetchUserSeries();
      return created;
    } catch (e: any) {
      toast.error("Failed to create series");
      console.error(e);
      return null;
    }
  };

  const updateSeries = async (seriesId: string, updates: Partial<DreamSeries>) => {
    try {
      const { error } = await supabase
        .from("dream_series")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", seriesId);
      if (error) throw error;
      toast.success("Series updated!");
      fetchUserSeries();
      return true;
    } catch (e) {
      toast.error("Failed to update series");
      return false;
    }
  };

  const deleteSeries = async (seriesId: string) => {
    try {
      const { error } = await supabase
        .from("dream_series")
        .delete()
        .eq("id", seriesId);
      if (error) throw error;
      toast.success("Series deleted");
      fetchUserSeries();
      return true;
    } catch (e) {
      toast.error("Failed to delete series");
      return false;
    }
  };

  return { series, isLoading, fetchUserSeries, createSeries, updateSeries, deleteSeries };
}

export function useSeriesChapters(seriesId?: string) {
  const [chapters, setChapters] = useState<SeriesChapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChapters = useCallback(async () => {
    if (!seriesId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_series_chapters")
        .select("*, dream:dream_entries(id, title, content, generatedImage, image_url, created_at, like_count, comment_count, profiles:profiles!dream_entries_user_id_fkey(username, display_name, avatar_url))")
        .eq("series_id", seriesId)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      setChapters(data || []);
    } catch (e) {
      console.error("Error fetching chapters:", e);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const addChapter = async (dreamId: string) => {
    if (!seriesId) return false;
    try {
      const nextNum = chapters.length > 0
        ? Math.max(...chapters.map(c => c.chapter_number)) + 1
        : 1;
      const { error } = await supabase
        .from("dream_series_chapters")
        .insert({ series_id: seriesId, dream_id: dreamId, chapter_number: nextNum });
      if (error) throw error;
      // Update chapter count
      await supabase
        .from("dream_series")
        .update({ chapter_count: nextNum, updated_at: new Date().toISOString() })
        .eq("id", seriesId);
      toast.success("Chapter added!");
      fetchChapters();
      return true;
    } catch (e: any) {
      if (e.code === "23505") toast.error("This dream is already in the series");
      else toast.error("Failed to add chapter");
      return false;
    }
  };

  const removeChapter = async (chapterId: string) => {
    if (!seriesId) return false;
    try {
      const { error } = await supabase
        .from("dream_series_chapters")
        .delete()
        .eq("id", chapterId);
      if (error) throw error;
      // Update chapter count
      await supabase
        .from("dream_series")
        .update({ chapter_count: Math.max(0, chapters.length - 1), updated_at: new Date().toISOString() })
        .eq("id", seriesId);
      toast.success("Chapter removed");
      fetchChapters();
      return true;
    } catch (e) {
      toast.error("Failed to remove chapter");
      return false;
    }
  };

  return { chapters, isLoading, fetchChapters, addChapter, removeChapter };
}

export function useSeriesFollow(userId?: string) {
  const [followedSeriesIds, setFollowedSeriesIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("dream_series_follows")
      .select("series_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        setFollowedSeriesIds(data?.map(r => r.series_id) || []);
      });
  }, [userId]);

  const toggleFollow = async (seriesId: string) => {
    if (!userId) return;
    const isFollowing = followedSeriesIds.includes(seriesId);
    try {
      if (isFollowing) {
        await supabase
          .from("dream_series_follows")
          .delete()
          .eq("user_id", userId)
          .eq("series_id", seriesId);
        setFollowedSeriesIds(prev => prev.filter(id => id !== seriesId));
        toast.success("Unfollowed series");
      } else {
        await supabase
          .from("dream_series_follows")
          .insert({ user_id: userId, series_id: seriesId });
        setFollowedSeriesIds(prev => [...prev, seriesId]);
        toast.success("Following series!");
      }
    } catch (e) {
      toast.error("Failed to update follow");
    }
  };

  return { followedSeriesIds, isFollowing: (id: string) => followedSeriesIds.includes(id), toggleFollow };
}

export function usePublicSeries() {
  const [series, setSeries] = useState<DreamSeries[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("dream_series")
          .select("*, profiles:user_id(username, display_name, avatar_url, avatar_symbol, avatar_color)")
          .eq("is_public", true)
          .order("updated_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        setSeries(data || []);
      } catch (e) {
        console.error("Error fetching public series:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { series, isLoading };
}

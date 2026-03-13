import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DreamMatch {
  id: string;
  user1_id: string;
  dream1_id: string;
  user2_id: string;
  dream2_id: string;
  match_percentage: number;
  shared_elements: string[];
  created_at: string;
  dream1?: {
    title: string;
    image_url: string | null;
    generatedImage: string | null;
    tags: string[];
  };
  dream2?: {
    title: string;
    image_url: string | null;
    generatedImage: string | null;
    tags: string[];
    profiles?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
}

export interface SyncAlert {
  id: string;
  theme: string;
  emoji: string;
  description: string;
  dreamer_count: number;
  dreamer_ids: string[];
  is_trending: boolean;
  created_at: string;
}

export interface CollectiveWave {
  id: string;
  theme: string;
  emoji: string;
  description: string;
  dream_count: number;
  percent_change: number;
  top_symbols: string[];
  timeframe_start: string;
  timeframe_end: string;
  created_at: string;
}

export interface DreamCluster {
  id: string;
  event_name: string;
  emoji: string;
  event_date: string;
  description: string;
  dream_count: number;
  top_themes: string[];
  created_at: string;
}

export type ConnectionFilter = "all" | "matches" | "clusters" | "waves" | "symbols";

export function useDreamConnections() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<DreamMatch[]>([]);
  const [syncAlerts, setSyncAlerts] = useState<SyncAlert[]>([]);
  const [waves, setWaves] = useState<CollectiveWave[]>([]);
  const [clusters, setClusters] = useState<DreamCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ConnectionFilter>("all");

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchMatches(), fetchSyncAlerts(), fetchWaves(), fetchClusters()]);
    setIsLoading(false);
  };

  const fetchMatches = async () => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("dream_matches")
      .select(`
        *,
        dream1:dream_entries!dream_matches_dream1_id_fkey(title, image_url, "generatedImage", tags),
        dream2:dream_entries!dream_matches_dream2_id_fkey(title, image_url, "generatedImage", tags, profiles:profiles!dream_entries_user_id_fkey(username, display_name, avatar_url))
      `)
      .gte("created_at", last24h)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setMatches(data as unknown as DreamMatch[]);
  };

  const fetchSyncAlerts = async () => {
    const last48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("sync_alerts")
      .select("*")
      .gte("created_at", last48h)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setSyncAlerts(data as SyncAlert[]);
  };

  const fetchWaves = async () => {
    const last72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("collective_waves")
      .select("*")
      .gte("created_at", last72h)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setWaves(data as CollectiveWave[]);
  };

  const fetchClusters = async () => {
    const { data } = await supabase
      .from("dream_clusters")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setClusters(data as DreamCluster[]);
  };

  const syncScore = useMemo(() => {
    const matchScore = matches.length * 5;
    const waveScore = waves.length * 10;
    return Math.min(100, matchScore + waveScore);
  }, [matches, waves]);

  const filteredItems = useMemo(() => {
    type FeedItem =
      | { type: "match"; data: DreamMatch; date: string }
      | { type: "sync"; data: SyncAlert; date: string }
      | { type: "wave"; data: CollectiveWave; date: string }
      | { type: "cluster"; data: DreamCluster; date: string };

    let items: FeedItem[] = [];

    if (filter === "all" || filter === "matches") {
      items.push(...matches.map((m) => ({ type: "match" as const, data: m, date: m.created_at })));
    }
    if (filter === "all" || filter === "symbols") {
      items.push(...syncAlerts.map((s) => ({ type: "sync" as const, data: s, date: s.created_at })));
    }
    if (filter === "all" || filter === "waves") {
      items.push(...waves.map((w) => ({ type: "wave" as const, data: w, date: w.created_at })));
    }
    if (filter === "all" || filter === "clusters") {
      items.push(...clusters.map((c) => ({ type: "cluster" as const, data: c, date: c.created_at })));
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, syncAlerts, waves, clusters, filter]);

  return {
    matches,
    syncAlerts,
    waves,
    clusters,
    filteredItems,
    isLoading,
    filter,
    setFilter,
    syncScore,
    refetch: fetchAll,
  };
}

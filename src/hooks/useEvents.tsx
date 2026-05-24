import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunityEvent {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  tags: string[];
  status: "draft" | "published" | "ended" | "archived";
  notify_users: boolean;
  created_at: string;
  rsvp_count?: number;
}

export interface EventInput {
  title: string;
  description?: string | null;
  banner_image_url?: string | null;
  link_url?: string | null;
  cta_label?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at: string;
  tags?: string[];
  status?: CommunityEvent["status"];
  notify_users?: boolean;
}

export const useEvents = (options: { adminView?: boolean } = {}) => {
  const { adminView = false } = options;
  const { user } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    let query = supabase.from("community_events").select("*").order("starts_at", { ascending: false });

    if (!adminView) {
      query = query.eq("status", "published").gt("ends_at", new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) {
      console.error("[useEvents] fetch error", error);
      setEvents([]);
      setIsLoading(false);
      return;
    }

    // Optionally attach RSVP counts for admin view
    if (adminView && data && data.length > 0) {
      const withCounts = await Promise.all(
        data.map(async (e: any) => {
          const { count } = await supabase
            .from("event_rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", e.id)
            .in("rsvp_status", ["going", "interested"]);
          return { ...e, rsvp_count: count || 0 } as CommunityEvent;
        }),
      );
      setEvents(withCounts);
    } else {
      setEvents((data || []) as CommunityEvent[]);
    }
    setIsLoading(false);
  }, [adminView]);

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel("community_events_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_events" },
        () => fetchEvents(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const createEvent = async (input: EventInput) => {
    if (!user) return { error: new Error("not signed in") };
    const { data, error } = await supabase
      .from("community_events")
      .insert({
        ...input,
        created_by: user.id,
        status: input.status || "draft",
      } as any)
      .select()
      .single();
    if (!error) await fetchEvents();
    return { data, error };
  };

  const updateEvent = async (id: string, patch: Partial<EventInput>) => {
    const { data, error } = await supabase
      .from("community_events")
      .update(patch as any)
      .eq("id", id)
      .select()
      .single();
    if (!error) await fetchEvents();
    return { data, error };
  };

  const updateStatus = async (id: string, status: CommunityEvent["status"]) => {
    return updateEvent(id, { status });
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("community_events").delete().eq("id", id);
    if (!error) await fetchEvents();
    return { error };
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    updateStatus,
    deleteEvent,
    refetch: fetchEvents,
  };
};

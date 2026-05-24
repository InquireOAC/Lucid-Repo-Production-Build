import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "./useEngagement";

export type RsvpStatus = "going" | "interested" | "declined";

/**
 * Per-event RSVP state for the current user. Toggling fires an engagement event.
 */
export const useEventRsvp = (eventId: string | null | undefined) => {
  const { user } = useAuth();
  const { recordEngagement } = useEngagement();
  const [rsvp, setRsvp] = useState<RsvpStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRsvp = useCallback(async () => {
    if (!user || !eventId) {
      setRsvp(null);
      return;
    }
    setIsLoading(true);
    const { data } = await supabase
      .from("event_rsvps")
      .select("rsvp_status")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();
    setRsvp((data?.rsvp_status as RsvpStatus | undefined) ?? null);
    setIsLoading(false);
  }, [user, eventId]);

  useEffect(() => {
    fetchRsvp();
  }, [fetchRsvp]);

  const setStatus = useCallback(
    async (status: RsvpStatus | null) => {
      if (!user || !eventId) return;
      if (status === null) {
        await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        setRsvp(null);
        return;
      }
      const { error } = await supabase
        .from("event_rsvps")
        .upsert(
          { event_id: eventId, user_id: user.id, rsvp_status: status },
          { onConflict: "event_id,user_id" },
        );
      if (!error) {
        setRsvp(status);
        recordEngagement("event", eventId, "rsvp", { status });
      }
    },
    [user, eventId, recordEngagement],
  );

  return { rsvp, isLoading, setStatus, refetch: fetchRsvp };
};

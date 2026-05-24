import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EngagementEntityType = "announcement" | "event" | "challenge";
export type EngagementAction = "view" | "click" | "dismiss" | "rsvp" | "enter" | "share";

/**
 * Returns a `recordEngagement` function that writes an engagement event via RPC.
 * `view` actions are deduped client-side to once per session per (type:id).
 */
export function useEngagement() {
  const seenViews = useRef<Set<string>>(new Set());

  const recordEngagement = useCallback(
    async (
      entityType: EngagementEntityType,
      entityId: string,
      action: EngagementAction,
      metadata: Record<string, unknown> = {},
    ) => {
      if (!entityId) return;

      if (action === "view") {
        const key = `${entityType}:${entityId}`;
        if (seenViews.current.has(key)) return;
        seenViews.current.add(key);
      }

      try {
        await supabase.rpc("record_engagement", {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_action: action,
          p_metadata: metadata,
        });
      } catch (err) {
        // Engagement tracking is best-effort — never throw
        console.debug("[useEngagement] failed", err);
      }
    },
    [],
  );

  return { recordEngagement };
}

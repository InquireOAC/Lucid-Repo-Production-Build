import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EngagementEntityType } from "./useEngagement";

export interface EngagementStats {
  views: number;
  unique_views: number;
  clicks: number;
  dismissals: number;
  rsvps: number;
  entries: number;
  shares: number;
  ctr: number;
  dismiss_rate: number;
}

const ZERO: EngagementStats = {
  views: 0,
  unique_views: 0,
  clicks: 0,
  dismissals: 0,
  rsvps: 0,
  entries: 0,
  shares: 0,
  ctr: 0,
  dismiss_rate: 0,
};

/**
 * Admin-only: fetches aggregated engagement metrics for a single entity.
 */
export const useAdminEngagementStats = (
  entityType: EngagementEntityType | null,
  entityId: string | null | undefined,
) => {
  const [stats, setStats] = useState<EngagementStats>(ZERO);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!entityType || !entityId) {
      setStats(ZERO);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.rpc("get_engagement_stats", {
      p_entity_type: entityType,
      p_entity_id: entityId,
    });
    if (error) {
      console.debug("[useAdminEngagementStats] error", error);
      setStats(ZERO);
    } else if (data && data[0]) {
      const row = data[0] as Record<string, number | string>;
      setStats({
        views: Number(row.views) || 0,
        unique_views: Number(row.unique_views) || 0,
        clicks: Number(row.clicks) || 0,
        dismissals: Number(row.dismissals) || 0,
        rsvps: Number(row.rsvps) || 0,
        entries: Number(row.entries) || 0,
        shares: Number(row.shares) || 0,
        ctr: Number(row.ctr) || 0,
        dismiss_rate: Number(row.dismiss_rate) || 0,
      });
    }
    setIsLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
};

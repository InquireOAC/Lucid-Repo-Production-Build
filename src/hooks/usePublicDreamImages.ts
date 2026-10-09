import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches a handful of recent PUBLIC dream image URLs for use as cinematic
 * backdrops on pre-auth surfaces (onboarding, sign-in, signed-out home).
 *
 * Works for anonymous visitors: RLS allows reading dream_entries where
 * is_public = true (the same query Auth.tsx already runs unauthenticated).
 * Returns an empty array while loading / if there are no public dreams yet,
 * so callers must render a gradient fallback.
 */
export function usePublicDreamImages(limit = 8): string[] {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("dream_entries")
      .select("image_url, generatedImage, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data || []) as Array<{ image_url: string | null; generatedImage: string | null }>;
        const seen = new Set<string>();
        const out: string[] = [];
        for (const d of rows) {
          const u = d.image_url || d.generatedImage;
          if (u && !seen.has(u)) {
            seen.add(u);
            out.push(u);
          }
          if (out.length >= limit) break;
        }
        setUrls(out);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return urls;
}

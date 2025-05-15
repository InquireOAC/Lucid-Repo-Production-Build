
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";

// Search public dreams by username, tag, or keyword in title/content
export function useRepoSearch(query: string) {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setDreams([]);
      return;
    }

    const fetchSearch = async () => {
      setIsLoading(true);
      // Search usernames
      let { data: profileIds } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", `%${query}%`);
      const matchIds = (profileIds ?? []).map((p: any) => p.id);

      // Search dreams: public only, match query in title/content, tags, or author (user_id)
      let { data, error } = await supabase
        .from("dream_entries")
        .select("*, profiles:user_id(username, profile_picture)")
        .eq("is_public", true)
        .or([
          `title.ilike.%${query}%`,
          `content.ilike.%${query}%`,
          matchIds.length ? `user_id.in.(${matchIds.join(",")})` : null
        ].filter(Boolean).join(","));

      setDreams(data || []);
      setIsLoading(false);
    };

    fetchSearch();
  }, [query]);

  return { dreams, isLoading };
}

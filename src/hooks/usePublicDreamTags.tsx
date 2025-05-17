
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamTag } from "@/types/dream";

// This hook fetches the global, public tags for filtering/displaying dreams on Lucid Repo
export function usePublicDreamTags() {
  const [tags, setTags] = useState<DreamTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("public_dream_tags")
        .select("*")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching public dream tags:", error);
        setTags([]);
      } else {
        setTags(data || []);
      }
      setIsLoading(false);
    };
    fetchTags();
  }, []);

  return { tags, isLoading };
}

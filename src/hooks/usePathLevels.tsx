import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PathLevel {
  id: string;
  path_id: string;
  level_number: number;
  title: string;
  description: string;
  xp_required: number;
  content: {
    overview: string;
    practices: Array<{
      id: string;
      title: string;
      xp: number;
    }>;
    videos: Array<{
      id: string;
      title: string;
      url: string;
      duration: string;
    }>;
    readings: Array<{
      id: string;
      title: string;
      content: string;
    }>;
    exercises: Array<{
      id: string;
      title: string;
      type: string;
      duration?: number;
      description: string;
    }>;
    achievement?: {
      id: string;
      title: string;
      xp: number;
      emoji: string;
    };
    unlocks?: string[];
  };
}

export const usePathLevels = (pathId?: string) => {
  return useQuery({
    queryKey: ["path-levels", pathId],
    queryFn: async () => {
      if (!pathId) return [];

      const { data, error } = await supabase
        .from("path_levels")
        .select("*")
        .eq("path_id", pathId)
        .order("level_number");

      if (error) throw error;
      return data as PathLevel[];
    },
    enabled: !!pathId,
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PathProgress {
  id: string;
  user_id: string;
  path_id: string;
  current_level: number;
  xp_earned: number;
  is_unlocked: boolean;
  completed_at?: string;
}

export const usePathProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["path-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_path_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as PathProgress[];
    },
    enabled: !!user,
  });

  const initializePathProgress = useMutation({
    mutationFn: async (pathId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_path_progress")
        .insert({
          user_id: user.id,
          path_id: pathId,
          current_level: 1,
          xp_earned: 0,
          is_unlocked: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path-progress"] });
    },
  });

  const updatePathProgress = useMutation({
    mutationFn: async ({ 
      pathId, 
      updates 
    }: { 
      pathId: string; 
      updates: Partial<PathProgress> 
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_path_progress")
        .update(updates)
        .eq("user_id", user.id)
        .eq("path_id", pathId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path-progress"] });
    },
  });

  return {
    progress,
    isLoading,
    initializePathProgress,
    updatePathProgress,
  };
};

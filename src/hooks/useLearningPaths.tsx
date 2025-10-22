import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LearningPath {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
}

export const useLearningPaths = () => {
  return useQuery({
    queryKey: ["learning-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_paths")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data as LearningPath[];
    },
  });
};

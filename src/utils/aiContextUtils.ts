
import { supabase } from "@/integrations/supabase/client";

/**
 * Get user's AI context for personalized image generation
 */
export const getUserAIContext = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_context')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching AI context:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching AI context:', error);
    return null;
  }
};

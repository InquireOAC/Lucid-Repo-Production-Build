
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDreamImageAI() {
  /**
   * Analyze dream content and get an image prompt
   */
  const getImagePrompt = useCallback(async (dreamContent: string) => {
    const result = await supabase.functions.invoke("analyze-dream", {
      body: { dreamContent, task: "create_image_prompt" },
    });
    if (result.error) {
      throw new Error(result.error.message || "Failed to generate image prompt");
    }
    return result.data?.analysis || "";
  }, []);

  /**
   * Generate a dream image from prompt via edge function
   */
  const generateDreamImageFromAI = useCallback(async (prompt: string) => {
    const body = { prompt };
    const result = await supabase.functions.invoke("generate-dream-image", { body });
    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Failed to generate image");
    }
    return (
      result.data?.imageUrl ||
      result.data?.image_url ||
      result.data?.generatedImage ||
      ""
    );
  }, []);

  return { getImagePrompt, generateDreamImageFromAI };
}

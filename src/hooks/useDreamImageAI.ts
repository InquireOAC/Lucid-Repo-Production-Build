
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAIContext } from "@/utils/aiContextUtils";
import { buildPersonalizedPrompt, cleanPromptForNonPersonalized } from "@/utils/promptBuildingUtils";

export function useDreamImageAI() {
  /**
   * Analyze dream content and get an image prompt with optional AI context and style
   */
  const getImagePrompt = useCallback(async (dreamContent: string, userId?: string, useAIContext: boolean = true, imageStyle?: string) => {
    // First get the base prompt from the analyze-dream function
    const result = await supabase.functions.invoke("analyze-dream", {
      body: { dreamContent, task: "create_image_prompt" },
    });
    
    if (result.error) {
      throw new Error(result.error.message || "Failed to generate image prompt");
    }

    const basePrompt = result.data?.analysis || "";

    // If useAIContext is false, clean the prompt intelligently
    if (!useAIContext) {
      return cleanPromptForNonPersonalized(basePrompt, dreamContent, imageStyle);
    }

    // If we have a user ID and should use AI context, try to get their AI context and personalize the prompt
    if (userId && useAIContext) {
      const aiContext = await getUserAIContext(userId);
      return buildPersonalizedPrompt(basePrompt, aiContext, imageStyle);
    }

    // If no AI context, just add style to base prompt
    return buildPersonalizedPrompt(basePrompt, null, imageStyle);
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

  return { 
    getImagePrompt, 
    generateDreamImageFromAI, 
    getUserAIContext: useCallback(getUserAIContext, []),
    buildPersonalizedPrompt: useCallback(buildPersonalizedPrompt, [])
  };
}

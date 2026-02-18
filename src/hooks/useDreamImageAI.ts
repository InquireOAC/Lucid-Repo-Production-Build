
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAIContext } from "@/utils/aiContextUtils";
import { buildPersonalizedPrompt, cleanPromptForNonPersonalized } from "@/utils/promptBuildingUtils";

export function useDreamImageAI() {
  const getImagePrompt = useCallback(async (dreamContent: string, userId?: string, useAIContext: boolean = true, imageStyle?: string) => {
    const result = await supabase.functions.invoke("analyze-dream", {
      body: { dreamContent, task: "create_image_prompt" },
    });
    
    if (result.error) {
      throw new Error(result.error.message || "Failed to generate image prompt");
    }

    const basePrompt = result.data?.analysis || "";

    if (!useAIContext) {
      return cleanPromptForNonPersonalized(basePrompt, dreamContent, imageStyle);
    }

    if (userId && useAIContext) {
      const aiContext = await getUserAIContext(userId);
      return buildPersonalizedPrompt(basePrompt, aiContext, imageStyle);
    }

    return buildPersonalizedPrompt(basePrompt, null, imageStyle);
  }, []);

  const generateDreamImageFromAI = useCallback(async (prompt: string, referenceImageUrl?: string, imageStyle?: string) => {
    const body: Record<string, string> = { prompt };
    if (referenceImageUrl) {
      body.referenceImageUrl = referenceImageUrl;
    }
    if (imageStyle) {
      body.imageStyle = imageStyle;
    }
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

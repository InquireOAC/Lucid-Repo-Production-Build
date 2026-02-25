
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAIContext } from "@/utils/aiContextUtils";
import { buildPersonalizedPrompt } from "@/utils/promptBuildingUtils";

export function useDreamImageAI() {
  const getImagePrompt = useCallback(async (dreamContent: string, userId?: string, useAIContext: boolean = true, imageStyle?: string) => {
    // Step 1: Get raw scene brief from analyze-dream (now using Gemini 3 Flash)
    const result = await supabase.functions.invoke("analyze-dream", {
      body: { dreamContent, task: "create_image_prompt" },
    });
    
    if (result.error) {
      throw new Error(result.error.message || "Failed to generate image prompt");
    }

    const rawBrief = result.data?.analysis || "";
    if (!rawBrief) throw new Error("No scene brief was generated");

    // Determine if character reference exists for the cinematic director
    let hasCharacterReference = false;
    let aiContext = null;

    if (userId && useAIContext) {
      aiContext = await getUserAIContext(userId);
      hasCharacterReference = !!(aiContext?.photo_url);
    }

    // Step 2: Pass through cinematic director thinking layer
    console.log("Composing cinematic prompt via thinking layer...");
    const cinematicResult = await supabase.functions.invoke("compose-cinematic-prompt", {
      body: { 
        sceneBrief: rawBrief, 
        imageStyle: imageStyle || "surreal",
        hasCharacterReference 
      },
    });

    if (cinematicResult.error) {
      console.warn("Cinematic director failed, falling back to raw brief:", cinematicResult.error);
      // Graceful fallback: use the raw brief with character integration if needed
      if (useAIContext && aiContext) {
        return buildPersonalizedPrompt(rawBrief, aiContext);
      }
      return rawBrief;
    }

    const cinematicPrompt = cinematicResult.data?.cinematicPrompt || rawBrief;

    // Step 3: Add character identity/integration directives if using AI context
    if (useAIContext && aiContext) {
      return buildPersonalizedPrompt(cinematicPrompt, aiContext);
    }

    return cinematicPrompt;
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

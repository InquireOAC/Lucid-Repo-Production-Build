
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { useDreamImageAI } from "./useDreamImageAI";
import { useUserRole } from "@/hooks/useUserRole";

interface UseImageGenerationProps {
  dreamContent: string;
  dreamId?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
  onSubscriptionRefresh?: () => void;
}

export const useImageGeneration = ({
  dreamContent,
  dreamId = "preview",
  onImageGenerated,
  disabled = false,
  onSubscriptionRefresh,
}: UseImageGenerationProps) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { hasUsedFeature, canUseFeature, recordFeatureUsage } = useFeatureUsage();
  const { getImagePrompt, generateDreamImageFromAI } = useDreamImageAI();

  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async (
    setImagePrompt: (prompt: string) => void,
    setGeneratedImage: (url: string) => void,
    _uploadImage: (url: string, dreamId: string) => Promise<string | null>,
    useAIContext: boolean = true,
    imageStyle: string = "surreal",
    selectedCharacterId?: string
  ) => {
    if (!user || disabled) return;
    setGeneratedImage("");
    setImagePrompt("");

    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for image generation.");
      return;
    }
    setIsGenerating(true);

    try {
      const canUse = isAdmin || (await canUseFeature("image"));
      if (!canUse) {
        showSubscriptionPrompt("image");
        setIsGenerating(false);
        return;
      }

      console.log("=== STARTING IMAGE GENERATION PROCESS ===");
      console.log("Using AI Context:", useAIContext);
      console.log("Image Style:", imageStyle);

      // 1. Get image prompt from analyze-dream with optional user context and style
      console.log("Step 1: Getting image prompt...");
      
      // If a specific character is selected, fetch their data
      let characterData: any = undefined;
      if (useAIContext && selectedCharacterId && user.id) {
        const { data: charRow } = await supabase
          .from("dream_characters")
          .select("*")
          .eq("id", selectedCharacterId)
          .single();
        if (charRow) {
          characterData = {
            photo_url: charRow.photo_url,
            visual_fingerprint: charRow.visual_fingerprint,
            name: charRow.name,
            outfit_photo_url: charRow.outfit_photo_url,
            accessory_photo_url: charRow.accessory_photo_url,
          };
          console.log("Using selected dream character:", charRow.name);
        }
      }

      const generatedPromptText = await getImagePrompt(dreamContent, user.id, useAIContext, imageStyle, characterData);
      if (!generatedPromptText) throw new Error("No image prompt was generated");
      setImagePrompt(generatedPromptText);
      console.log("Image prompt generated:", generatedPromptText);

      // 2. If using AI context, get reference photo URL (from selected character or ai_context)
      let referenceImageUrl: string | undefined;
      if (useAIContext && user.id) {
        if (characterData?.photo_url) {
          referenceImageUrl = characterData.photo_url;
          console.log("Using selected character photo as reference");
        } else {
          const { getUserAIContext } = await import("@/utils/aiContextUtils");
          const aiContext = await getUserAIContext(user.id);
          if (aiContext?.photo_url) {
            referenceImageUrl = aiContext.photo_url;
            console.log("Reference photo found from AI context");
          }
        }
      }

      // 3. Generate image from prompt via edge function
      console.log("Step 2: Generating image from AI...");
      const openaiUrl = await generateDreamImageFromAI(generatedPromptText, referenceImageUrl, imageStyle);
      if (!openaiUrl) throw new Error("No image URL was returned from AI generation");
      console.log("AI image generated:", openaiUrl);

      // 3. Show the image (already a permanent Supabase URL from edge function)
      setGeneratedImage(openaiUrl);
      onImageGenerated(openaiUrl, generatedPromptText);
      toast.success("Dream image generated!");

      // 4. Record feature usage and refresh subscription data
      if (!isAdmin) {
        if (!hasUsedFeature("image")) {
          markFeatureAsUsed("image");
        } else {
          console.log('Recording image usage in database...');
          const usageRecorded = await recordFeatureUsage("image");
          console.log('Image usage recorded:', usageRecorded);
        }
        
        if (onSubscriptionRefresh) {
          console.log('Refreshing subscription data after image generation...');
          setTimeout(() => {
            console.log('Delayed subscription refresh executing...');
            onSubscriptionRefresh();
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error("=== IMAGE GENERATION FAILED ===");
      console.error("Error details:", error);
      toast.error(`Image generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [
    user,
    disabled,
    dreamContent,
    dreamId,
    isAdmin,
    canUseFeature,
    markFeatureAsUsed,
    hasUsedFeature,
    recordFeatureUsage,
    onImageGenerated,
    onSubscriptionRefresh,
    getImagePrompt,
    generateDreamImageFromAI,
  ]);

  return {
    isGenerating,
    generateImage,
    isAppCreator: isAdmin,
    hasUsedFeature: (feature: "image" | "analysis") => hasUsedFeature(feature),
  };
};

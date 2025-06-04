
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { useDreamImageAI } from "./useDreamImageAI";

interface UseImageGenerationProps {
  dreamContent: string;
  dreamId?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
}

export const useImageGeneration = ({
  dreamContent,
  dreamId = "preview",
  onImageGenerated,
  disabled = false,
}: UseImageGenerationProps) => {
  const { user } = useAuth();
  const { hasUsedFeature, markFeatureAsUsed, canUseFeature } = useFeatureUsage();
  const { getImagePrompt, generateDreamImageFromAI } = useDreamImageAI();

  const [isGenerating, setIsGenerating] = useState(false);
  const isAppCreator = user?.email === "inqu********@gmail.com";

  const generateImage = useCallback(async (
    setImagePrompt: (prompt: string) => void,
    setGeneratedImage: (url: string) => void,
    uploadImage: (url: string, dreamId: string) => Promise<string | null>
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
      const canUse = isAppCreator || (await canUseFeature("image"));
      if (!canUse) {
        showSubscriptionPrompt("image");
        setIsGenerating(false);
        return;
      }

      console.log("=== STARTING IMAGE GENERATION PROCESS ===");

      // 1. Get image prompt from analyze-dream
      console.log("Step 1: Getting image prompt...");
      const generatedPromptText = await getImagePrompt(dreamContent);
      if (!generatedPromptText) throw new Error("No image prompt was generated");
      setImagePrompt(generatedPromptText);
      console.log("Image prompt generated:", generatedPromptText);

      // 2. Generate image from prompt via edge function
      console.log("Step 2: Generating image from AI...");
      const openaiUrl = await generateDreamImageFromAI(generatedPromptText);
      if (!openaiUrl) throw new Error("No image URL was returned from AI generation");
      console.log("AI image generated:", openaiUrl);

      // 3. Immediately show the AI image to user
      setGeneratedImage(openaiUrl);
      onImageGenerated(openaiUrl, generatedPromptText);

      // 4. Try to upload image to Supabase in background (non-blocking)
      console.log("Step 3: Attempting background upload to Supabase...");
      
      try {
        const uploadPromise = uploadImage(openaiUrl, dreamId);
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Upload timeout")), 10000)
        );
        
        const supabaseUrl = await Promise.race([uploadPromise, timeoutPromise]);
        
        if (supabaseUrl) {
          console.log("Upload successful, updating with Supabase URL:", supabaseUrl);
          setGeneratedImage(supabaseUrl);
          onImageGenerated(supabaseUrl, generatedPromptText);
          toast.success("Dream image generated and saved permanently!");
        } else {
          console.warn("Upload returned null - keeping temporary URL");
          toast.success("Image generated! Note: Using temporary URL for display.");
        }
      } catch (uploadError) {
        console.warn("Background upload failed:", uploadError);
        toast.success("Image generated! Note: Could not save permanently to cloud.");
      }

      // Mark feature as used only after successful generation
      if (!isAppCreator && !hasUsedFeature("image")) markFeatureAsUsed("image");
      
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
    isAppCreator,
    canUseFeature,
    markFeatureAsUsed,
    hasUsedFeature,
    onImageGenerated,
    getImagePrompt,
    generateDreamImageFromAI,
  ]);

  return {
    isGenerating,
    generateImage,
    isAppCreator,
    hasUsedFeature: (feature: "image" | "analysis") => hasUsedFeature(feature),
  };
};

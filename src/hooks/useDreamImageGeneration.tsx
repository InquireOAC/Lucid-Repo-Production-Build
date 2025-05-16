import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { uploadDreamImage, preloadImage } from "@/utils/imageUtils";

interface UseDreamImageGenerationProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
  dreamId?: string; // Optional dreamId for better context in uploadDreamImage
}

export const useDreamImageGeneration = ({
  dreamContent,
  existingPrompt = "",
  existingImage = "",
  onImageGenerated,
  disabled = false,
  dreamId = "preview"
}: UseDreamImageGenerationProps) => {
  const { user } = useAuth();
  const { hasUsedFeature, markFeatureAsUsed, canUseFeature } = useFeatureUsage();
  
  const [imagePrompt, setImagePrompt] = useState(existingPrompt);
  const [generatedImage, setGeneratedImage] = useState(existingImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isAppCreator = user?.email === "inquireoac@gmail.com";

  useEffect(() => {
    if (existingImage) {
      setGeneratedImage(existingImage);
      setImageError(false);
      preloadImage(existingImage);
    } else {
      // Reset if existingImage becomes empty (e.g. parent component clears it)
      setGeneratedImage("");
      setImagePrompt("");
    }
  }, [existingImage]);

  const generateImage = useCallback(async () => {
    if (!user || disabled) return;

    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for image generation.");
      return;
    }
    try {
      const canUse = isAppCreator || await canUseFeature('image');
      if (!canUse) {
        showSubscriptionPrompt('image');
        return;
      }

      setIsGenerating(true);
      setImageError(false);

      const promptResult = await supabase.functions.invoke('analyze-dream', {
        body: { dreamContent, task: 'create_image_prompt' }
      });

      if (promptResult.error) throw new Error(promptResult.error.message || 'Failed to generate image prompt');
      const generatedPromptText = promptResult.data?.analysis || '';
      if (!generatedPromptText) throw new Error('No image prompt was generated');

      setImagePrompt(generatedPromptText);
      console.log("Generated prompt:", generatedPromptText);

      const imageResult = await supabase.functions.invoke('generate-dream-image', {
        body: { prompt: generatedPromptText }
      });

      if (imageResult.error) {
        console.error("Image generation API error:", imageResult.error);
        throw new Error(imageResult.error.message || 'Failed to generate image');
      }

      const openaiUrl = imageResult.data?.imageUrl || imageResult.data?.image_url;
      if (!openaiUrl) throw new Error('No image URL was returned from AI generation');

      setGeneratedImage(openaiUrl);

      if (!isAppCreator && !hasUsedFeature('image')) {
        markFeatureAsUsed('image');
      }

      try {
        // Upload and always use Supabase public URL; only use the temp URL if upload fails
        const storedImageUrl = await uploadDreamImage(dreamId, openaiUrl, user.id);

        // Patch: Warn and fallback if not a public Supabase URL
        if (
          !storedImageUrl ||
          storedImageUrl === openaiUrl ||
          !storedImageUrl.startsWith(
            `${supabase.storageUrl?.replace(/\/$/, '') ?? "https://oelghoaiuvjhywlzldkt.supabase.co"}/storage/v1/object/public/dream-images/`
          )
        ) {
          setGeneratedImage(openaiUrl);
          onImageGenerated(openaiUrl, generatedPromptText);
          toast.warning("Image generated, but not saved to permanent storage. You may not see it later.");
        } else {
          setGeneratedImage(storedImageUrl);
          onImageGenerated(storedImageUrl, generatedPromptText);
          toast.success("Dream image generated and saved!");
        }
      } catch (uploadError: any) {
        console.error(`Upload error during ${dreamId} generation:`, uploadError);
        setGeneratedImage(openaiUrl);
        toast.error(`Image upload failed: ${uploadError.message}. Using temporary image.`);
        onImageGenerated(openaiUrl, generatedPromptText);
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      setImageError(true);
      toast.error(`Image generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [user, disabled, dreamContent, isAppCreator, canUseFeature, markFeatureAsUsed, hasUsedFeature, onImageGenerated, dreamId, supabase]);

  // Derived state for showing initial info
  const showInfo = !existingImage && !generatedImage;

  return {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    isGenerating,
    showInfo, // This is now derived correctly based on initial state and generation
    imageError,
    setImageError, // Allow parent to set error, e.g. on ImageDisplay error
    generateImage,
    isAppCreator,
    hasUsedFeature: (feature: 'image' | 'analysis') => hasUsedFeature(feature)
  };
};

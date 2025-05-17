
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

interface UseDreamImageGenerationProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
  dreamId?: string;
}

export const useDreamImageGeneration = ({
  dreamContent,
  existingPrompt = "",
  existingImage = "",
  onImageGenerated,
  disabled = false,
  dreamId = "preview",
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
    } else {
      setGeneratedImage("");
      setImagePrompt("");
    }
  }, [existingImage]);

  // This method is called for both AI-generated or user-uploaded image
  const uploadAndGetPublicImageUrl = async (image: string, prompt: string) => {
    if (!user) {
      toast.error("Not logged in; cannot upload images.");
      return "";
    }
    if (image.startsWith("data:image") || image.startsWith("http")) {
      try {
        setIsGenerating(true);
        setImageError(false);
        const uploadedUrl = await uploadImageToSupabase(image, user.id, dreamId);
        if (!uploadedUrl || !uploadedUrl.startsWith("http")) {
          toast.error("Problem uploading image. Please try again.");
          setImageError(true);
          return "";
        }
        setGeneratedImage(uploadedUrl);
        onImageGenerated(uploadedUrl, prompt);
        return uploadedUrl;
      } catch (error: any) {
        setImageError(true);
        toast.error("Upload failed: " + (error?.message || "Unknown error"));
        return "";
      } finally {
        setIsGenerating(false);
      }
    }
    return "";
  };

  const generateImage = useCallback(async () => {
    if (!user || disabled) return;

    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for image generation.");
      return;
    }

    try {
      const canUse = isAppCreator || (await canUseFeature("image"));
      if (!canUse) {
        showSubscriptionPrompt("image");
        return;
      }

      setIsGenerating(true);
      setImageError(false);

      // 1. Generate prompt
      const promptResult = await supabase.functions.invoke("analyze-dream", {
        body: { dreamContent, task: "create_image_prompt" },
      });

      if (promptResult.error) throw new Error(promptResult.error.message || "Failed to generate image prompt");
      const generatedPromptText = promptResult.data?.analysis || "";
      if (!generatedPromptText) throw new Error("No image prompt was generated");

      setImagePrompt(generatedPromptText);

      // 2. Generate AI image
      const imageResult = await supabase.functions.invoke("generate-dream-image", {
        body: { prompt: generatedPromptText },
      });

      if (imageResult.error) throw new Error(imageResult.error.message || "Failed to generate image");
      const openaiUrl = imageResult.data?.imageUrl || imageResult.data?.image_url;
      if (!openaiUrl) throw new Error("No image URL was returned from AI generation");

      // 3. Upload to Supabase Storage as PNG
      const supabaseUrl = await uploadAndGetPublicImageUrl(openaiUrl, generatedPromptText);

      if (supabaseUrl) {
        toast.success("Dream image generated and saved permanently!");
        if (!isAppCreator && !hasUsedFeature("image")) markFeatureAsUsed("image");
      } else {
        throw new Error("Failed to persist generated image.");
      }
    } catch (error: any) {
      setImageError(true);
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
  ]);

  // Allow the user to upload their own image. This method must always be available!
  const handleImageFromFile = async (fileDataUrl: string) => {
    if (!fileDataUrl || !user) {
      setImageError(true);
      toast.error("Could not add image. Please try again.");
      return;
    }
    setIsGenerating(true);
    const publicUrl = await uploadAndGetPublicImageUrl(fileDataUrl, imagePrompt || "");
    setIsGenerating(false);
    if (!publicUrl) setImageError(true);
  };

  // "showInfo" is now only true if there is no image yet.
  const showInfo = !existingImage && !generatedImage;

  return {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    isGenerating,
    showInfo,
    imageError,
    setImageError,
    generateImage,
    isAppCreator,
    hasUsedFeature: (feature: "image" | "analysis") => hasUsedFeature(feature),
    handleImageFromFile, // Always show
  };
};

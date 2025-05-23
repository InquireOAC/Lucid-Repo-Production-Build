
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { useDreamImageUploader } from "./useDreamImageUploader";
import { useDreamImageAI } from "./useDreamImageAI";
import { downloadImageAsPng } from "@/utils/downloadImageAsPng";

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
  const { uploadAndGetPublicImageUrl } = useDreamImageUploader();
  const { getImagePrompt, generateDreamImageFromAI } = useDreamImageAI();

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

  const generateImage = useCallback(async () => {
    if (!user || disabled) return;
    setImageError(false);
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

      // 1. Get image prompt from analyze-dream
      const generatedPromptText = await getImagePrompt(dreamContent);
      if (!generatedPromptText) throw new Error("No image prompt was generated");
      setImagePrompt(generatedPromptText);

      // 2. Generate image from prompt via edge function
      const openaiUrl = await generateDreamImageFromAI(generatedPromptText);
      if (!openaiUrl) throw new Error("No image URL was returned from AI generation");

      // Immediately display the AI-generated image to the user while uploading
      setGeneratedImage(openaiUrl);
      onImageGenerated(openaiUrl, generatedPromptText); // temporarily pass this URL so UI can show image

      // 3. Download as PNG (for user's local copy, optional)
      await downloadImageAsPng(openaiUrl, "dream-image.png");

      // 4. Upload/downloaded image to Supabase. (Persist, always use Supabase URL if possible)
      setIsGenerating(true); // ensure state during uploading
      const supabaseUrl = await uploadAndGetPublicImageUrl(openaiUrl, generatedPromptText, dreamId);

      if (supabaseUrl && supabaseUrl.startsWith("http")) {
        setGeneratedImage(supabaseUrl);
        onImageGenerated(supabaseUrl, generatedPromptText);
        toast.success("Dream image generated and saved permanently!");
        if (!isAppCreator && !hasUsedFeature("image")) markFeatureAsUsed("image");
      } else {
        // Even if failed, leave the openaiUrl showing in the dream entry
        // Only show warning
        toast.error("Failed to persist generated image in storage. Image will be shown but might be temporary.");
      }
    } catch (error: any) {
      setImageError(true);
      toast.error(`Image generation failed: ${error.message}`);
      console.error("Image generation failed (full error):", error);
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
    uploadAndGetPublicImageUrl,
  ]);

  const handleImageFromFile = async (fileDataUrl: string) => {
    console.log("useDreamImageGeneration: handleImageFromFile received", typeof fileDataUrl, fileDataUrl?.slice?.(0, 36), "... (truncated)");
    if (!fileDataUrl || !user) {
      setImageError(true);
      toast.error("Could not add image. Please try again.");
      console.error("useDreamImageGeneration: fileDataUrl or user missing", { fileDataUrl, user });
      return;
    }
    setIsGenerating(true);
    const publicUrl = await uploadAndGetPublicImageUrl(fileDataUrl, imagePrompt || "", dreamId);
    setIsGenerating(false);
    if (!publicUrl) {
      setImageError(true);
      setGeneratedImage(fileDataUrl); // fallback: show uploaded file in UI, even if it’s just local
      onImageGenerated(fileDataUrl, imagePrompt || "");
      toast.error("Failed to persist uploaded image to storage. Using local version (might be temporary).");
      console.error("useDreamImageGeneration: upload failed, fallback to data URL");
    } else {
      setGeneratedImage(publicUrl);
      onImageGenerated(publicUrl, imagePrompt || "");
      console.log("useDreamImageGeneration: uploaded to Supabase, publicUrl:", publicUrl);
    }
  };

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
    handleImageFromFile, // Always show for file upload
  };
};

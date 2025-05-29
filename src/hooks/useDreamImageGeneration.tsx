
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { useReliableImageUpload } from "./useReliableImageUpload";
import { useDreamImageAI } from "./useDreamImageAI";

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
  const { uploadImage } = useReliableImageUpload();
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

      // 4. Upload image to Supabase in background
      console.log("Step 3: Uploading to Supabase...");
      const supabaseUrl = await uploadImage(openaiUrl, dreamId);

      if (supabaseUrl) {
        console.log("Upload successful, updating with Supabase URL:", supabaseUrl);
        setGeneratedImage(supabaseUrl);
        onImageGenerated(supabaseUrl, generatedPromptText);
        toast.success("Dream image generated and saved!");
        if (!isAppCreator && !hasUsedFeature("image")) markFeatureAsUsed("image");
      } else {
        console.warn("Upload failed, keeping OpenAI URL");
        toast.warning("Image generated but not saved to storage. Image may be temporary.");
      }
    } catch (error: any) {
      console.error("=== IMAGE GENERATION FAILED ===");
      console.error("Error details:", error);
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
    getImagePrompt,
    generateDreamImageFromAI,
    uploadImage,
  ]);

  const handleImageFromFile = async (fileDataUrl: string) => {
    console.log("handleImageFromFile triggered");
    if (!fileDataUrl || !user) {
      setImageError(true);
      toast.error("Could not add image. Please try again.");
      return;
    }
    setIsGenerating(true);
    try {
      // Convert data URL to blob
      const response = await fetch(fileDataUrl);
      const blob = await response.blob();
      
      // Use reliable upload with blob data
      const publicUrl = await uploadImage(URL.createObjectURL(blob), dreamId);
      if (!publicUrl) {
        setImageError(true);
        setGeneratedImage(fileDataUrl); // show local fallback
        onImageGenerated(fileDataUrl, imagePrompt || "");
        toast.error("Failed to persist uploaded image. Using local image.");
      } else {
        setGeneratedImage(publicUrl);
        onImageGenerated(publicUrl, imagePrompt || "");
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      setImageError(true);
      toast.error("Upload error: " + (error as any)?.message);
    } finally {
      setIsGenerating(false);
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
    handleImageFromFile,
  };
};

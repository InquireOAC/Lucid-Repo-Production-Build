import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";
import { saveAs } from "file-saver";

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

  // Util: download image as PNG
  async function downloadImageAsPng(imageUrl: string, filename: string = "dream-image.png") {
    try {
      // Fetch image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      // Convert to PNG if not already
      let pngBlob = blob;
      if (blob.type !== "image/png") {
        // Convert using HTMLCanvas
        const img = document.createElement("img");
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        pngBlob = new Blob([byteArray], { type: "image/png" });
      }
      // Use FileSaver for best compatibility
      saveAs(pngBlob, filename);
    } catch (err) {
      console.error("Failed to auto-download dream image:", err);
    }
  }

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

      console.log("[DreamImageGeneration] Calling analyze-dream edge function", { dreamContent });

      const promptResult = await supabase.functions.invoke("analyze-dream", {
        body: { dreamContent, task: "create_image_prompt" },
      });

      if (promptResult.error) {
        console.error("analyze-dream error:", promptResult.error, promptResult);
        throw new Error(promptResult.error.message || "Failed to generate image prompt");
      }
      const generatedPromptText = promptResult.data?.analysis || "";
      if (!generatedPromptText) throw new Error("No image prompt was generated");

      setImagePrompt(generatedPromptText);

      const body = { prompt: generatedPromptText };
      console.log("[DreamImageGeneration] Invoking generate-dream-image with body:", body);

      const imageResult = await supabase.functions.invoke("generate-dream-image", {
        body,
      });

      if (imageResult.error || !imageResult.data) {
        console.error("generate-dream-image error:", imageResult.error, imageResult);
        throw new Error(imageResult.error?.message || "Failed to generate image");
      }

      const openaiUrl =
        imageResult.data?.imageUrl ||
        imageResult.data?.image_url ||
        imageResult.data?.generatedImage;
      if (!openaiUrl) throw new Error("No image URL was returned from AI generation");
      console.log("[DreamImageGeneration] Image generated. URL:", openaiUrl);

      // Download image (to get a PNG, if not already), then upload to Supabase and persist
      // (User will get an auto-download for local save but always use Supabase persisted URL in app)
      await downloadImageAsPng(openaiUrl, "dream-image.png");

      // Now ensure upload to Supabase, only use Supabase URL!
      setIsGenerating(true); // In case previous isGenerating was toggled by download fn

      const supabaseUrl = await uploadAndGetPublicImageUrl(openaiUrl, generatedPromptText);

      if (supabaseUrl && supabaseUrl.startsWith("http")) {
        setGeneratedImage(supabaseUrl);
        onImageGenerated(supabaseUrl, generatedPromptText);
        toast.success("Dream image generated and saved permanently!");
        if (!isAppCreator && !hasUsedFeature("image")) markFeatureAsUsed("image");
      } else {
        // Fail: do not use OpenAI/transient URL further
        console.error("[DreamImageGeneration] Failed to persist the generated image to Supabase storage: ", supabaseUrl);
        setGeneratedImage(""); // Clean up state
        throw new Error("Failed to persist generated image. It could not be saved in storage.");
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
    handleImageFromFile, // Always show for file upload
  };
};

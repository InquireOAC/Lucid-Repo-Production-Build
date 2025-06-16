
import { useReliableImageUpload } from "./useReliableImageUpload";
import { useImageGeneration } from "./useImageGeneration";
import { useImageState } from "./useImageState";

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
  const { uploadImage } = useReliableImageUpload();
  
  const {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    setGeneratedImage,
    imageError,
    setImageError,
    showInfo,
    useAIContext,
    setUseAIContext,
    imageStyle,
    setImageStyle,
  } = useImageState({ existingPrompt, existingImage });

  const {
    isGenerating,
    generateImage: generateImageCore,
    isAppCreator,
    hasUsedFeature,
  } = useImageGeneration({
    dreamContent,
    dreamId,
    onImageGenerated,
    disabled,
  });

  const generateImage = () => {
    generateImageCore(setImagePrompt, setGeneratedImage, uploadImage, useAIContext, imageStyle);
  };

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
    hasUsedFeature,
    useAIContext,
    setUseAIContext,
    imageStyle,
    setImageStyle,
  };
};

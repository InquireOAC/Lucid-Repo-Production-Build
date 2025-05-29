
import { useReliableImageUpload } from "./useReliableImageUpload";
import { useImageGeneration } from "./useImageGeneration";
import { useImageFileUpload } from "./useImageFileUpload";
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

  const {
    isUploading,
    handleImageFromFile: handleImageFromFileCore,
  } = useImageFileUpload({
    dreamId,
    onImageGenerated,
    imagePrompt,
  });

  const generateImage = () => {
    generateImageCore(setImagePrompt, setGeneratedImage, uploadImage);
  };

  const handleImageFromFile = (fileDataUrl: string) => {
    handleImageFromFileCore(fileDataUrl, uploadImage, setImageError);
  };

  return {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    isGenerating: isGenerating || isUploading,
    showInfo,
    imageError,
    setImageError,
    generateImage,
    isAppCreator,
    hasUsedFeature,
    handleImageFromFile,
  };
};

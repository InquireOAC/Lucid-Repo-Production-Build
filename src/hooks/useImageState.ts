
import { useState } from "react";

interface UseImageStateProps {
  existingPrompt: string;
  existingImage: string;
}

export const useImageState = ({ existingPrompt, existingImage }: UseImageStateProps) => {
  const [imagePrompt, setImagePrompt] = useState(existingPrompt);
  const [generatedImage, setGeneratedImage] = useState(existingImage);
  const [imageError, setImageError] = useState(false);
  const [useAIContext, setUseAIContext] = useState(true);
  
  const showInfo = !imagePrompt && !generatedImage;

  return {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    setGeneratedImage,
    imageError,
    setImageError,
    showInfo,
    useAIContext,
    setUseAIContext,
  };
};

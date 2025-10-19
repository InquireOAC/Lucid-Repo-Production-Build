
import { useState, useEffect } from "react";

interface UseImageStateProps {
  existingPrompt: string;
  existingImage: string;
}

export const useImageState = ({ existingPrompt, existingImage }: UseImageStateProps) => {
  const [imagePrompt, setImagePrompt] = useState(existingPrompt);
  const [generatedImage, setGeneratedImage] = useState(existingImage);
  const [imageError, setImageError] = useState(false);
  const [useAIContext, setUseAIContext] = useState(false);
  const [imageStyle, setImageStyle] = useState("surreal");

  // Determine if we should show the initial prompt or the full interface
  const showInfo = !existingPrompt && !existingImage;

  // Update states when existing values change
  useEffect(() => {
    if (existingPrompt !== imagePrompt) {
      setImagePrompt(existingPrompt);
    }
  }, [existingPrompt]);

  useEffect(() => {
    if (existingImage !== generatedImage) {
      setGeneratedImage(existingImage);
    }
  }, [existingImage]);

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
    imageStyle,
    setImageStyle,
  };
};

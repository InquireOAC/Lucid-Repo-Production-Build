
import { useState, useEffect } from "react";

interface UseImageStateProps {
  existingPrompt?: string;
  existingImage?: string;
}

export const useImageState = ({
  existingPrompt = "",
  existingImage = "",
}: UseImageStateProps) => {
  const [imagePrompt, setImagePrompt] = useState(existingPrompt);
  const [generatedImage, setGeneratedImage] = useState(existingImage);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (existingImage) {
      setGeneratedImage(existingImage);
      setImageError(false);
    } else {
      setGeneratedImage("");
      setImagePrompt("");
    }
  }, [existingImage]);

  const showInfo = !existingImage && !generatedImage;

  return {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    setGeneratedImage,
    imageError,
    setImageError,
    showInfo,
  };
};

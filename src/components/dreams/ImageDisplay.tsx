
import React, { useState } from "react";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
}

const LOCAL_PLACEHOLDER = "/placeholder.svg";

const ImageDisplay = ({ imageUrl, imageDataUrl, onError }: ImageDisplayProps) => {
  const [imageError, setImageError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    console.error("Image load error");
    onError();
    const img = e.currentTarget;
    // Only swap to local placeholder once to prevent infinite loop
    if (img.src !== window.location.origin + LOCAL_PLACEHOLDER && img.src !== window.location.origin + "/" + LOCAL_PLACEHOLDER) {
      img.src = LOCAL_PLACEHOLDER;
    }
  };

  const srcToShow =
    imageDataUrl && imageDataUrl.startsWith("data:image/")
      ? imageDataUrl
      : imageUrl && !imageError
      ? imageUrl
      : LOCAL_PLACEHOLDER;

  return (
    <div className="mb-4">
      <img
        src={srcToShow}
        alt="Dream"
        className="w-full rounded-md aspect-square object-cover"
        onError={handleError}
      />
      {imageError && (
        <p className="text-xs text-red-500 mt-1">
          There was an issue displaying the image. Try regenerating.
        </p>
      )}
    </div>
  );
};

export default ImageDisplay;

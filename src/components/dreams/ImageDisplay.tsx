
import React, { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageDisplayProps {
  imageUrl: string;
  onError: () => void;
}

const ImageDisplay = ({ imageUrl, onError }: ImageDisplayProps) => {
  const [imageError, setImageError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    console.error("Image load error");
    onError();
    const img = e.currentTarget;
    img.src = "https://via.placeholder.com/400?text=Image+Error";
  };

  return (
    <div className="mb-4 w-full">
      <AspectRatio ratio={1 / 1} className="overflow-hidden rounded-md">
        <img
          src={imageUrl}
          alt="Dream"
          className="w-full h-full object-cover"
          onError={handleError}
        />
      </AspectRatio>
      {imageError && (
        <p className="text-xs text-red-500 mt-1">
          There was an issue displaying the image. Try regenerating.
        </p>
      )}
    </div>
  );
};

export default ImageDisplay;

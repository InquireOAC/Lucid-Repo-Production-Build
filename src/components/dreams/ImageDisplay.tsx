
import React, { useState } from "react";

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
    <div className="mb-4">
      <img
        src={imageUrl}
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

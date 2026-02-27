
import React from "react";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  disabled?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  imageDataUrl,
  onError,
  disabled = false,
}) => {
  const displayUrl = imageDataUrl || imageUrl;

  return (
    <>
      {displayUrl ? (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={displayUrl}
            alt="Dream visualization"
            className="w-full aspect-[4/3] object-cover"
            onError={onError}
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-muted/30">
          <p className="text-muted-foreground text-center text-sm">
            Generate an image for your dream
          </p>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;

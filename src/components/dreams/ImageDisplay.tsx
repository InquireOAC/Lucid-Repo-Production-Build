
import React from "react";
import { useLocalMedia } from "@/hooks/useLocalMedia";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  disabled?: boolean;
  dreamId?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  imageDataUrl,
  onError,
  disabled = false,
  dreamId,
}) => {
  const cachedUrl = useLocalMedia(dreamId, imageUrl || imageDataUrl, 'image');
  const displayUrl = imageDataUrl || cachedUrl || imageUrl;

  return (
    <>
      {displayUrl ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[9/16]">
          <img
            src={displayUrl}
            alt="Dream visualization"
            className="w-full h-full rounded-2xl object-contain"
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

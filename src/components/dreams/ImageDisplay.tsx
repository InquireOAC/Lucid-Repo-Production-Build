
import React, { useState, useRef } from "react";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
}

const ImageDisplay = ({ imageUrl, imageDataUrl, onError }: ImageDisplayProps) => {
  const [imageError, setImageError] = useState(false);
  const [localFileUrl, setLocalFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    console.error("Image load error");
    onError();
  };

  // Handler for users to select previously downloaded PNG on error
  const handlePickLocalFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset so they can select the same file again.
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setLocalFileUrl(url);
      setImageError(false);
    }
  };

  // Choose what to display: If local file from disk is set (after error), use that.
  // Else, try base64 DataURL first, else imageUrl, else nothing if errored.
  let srcToShow = null;
  if (localFileUrl) {
    srcToShow = localFileUrl;
  } else if (imageDataUrl && imageDataUrl.startsWith("data:image/")) {
    srcToShow = imageDataUrl;
  } else if (imageUrl && !imageError) {
    srcToShow = imageUrl;
  }

  return (
    <div className="mb-4">
      {srcToShow && (
        <img
          src={srcToShow}
          alt="Dream"
          className="w-full rounded-md aspect-square object-cover"
          onError={handleError}
        />
      )}
      {imageError && (
        <div className="flex flex-col items-center mt-2 gap-2">
          <p className="text-xs text-red-500">
            There was an issue displaying the image.
          </p>
          <button
            type="button"
            className="px-3 py-1 rounded bg-dream-purple text-white hover:bg-dream-lavender transition"
            onClick={handlePickLocalFile}
          >
            Load Image from File
          </button>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;

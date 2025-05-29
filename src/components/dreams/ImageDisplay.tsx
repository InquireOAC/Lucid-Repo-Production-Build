
import React from "react";
import ImageFileUploader from "./ImageFileUploader";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  onImageChange?: (base64DataUrl: string) => void;
  disabled?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  imageDataUrl,
  onError,
  onImageChange,
  disabled = false,
}) => {
  const displayUrl = imageDataUrl || imageUrl;

  const handleUploadError = (errorMessage: string) => {
    console.error("Image upload error:", errorMessage);
    onError();
  };

  return (
    <div className="space-y-4">
      {displayUrl ? (
        <div className="relative">
          <img
            src={displayUrl}
            alt="Dream visualization"
            className="w-full h-64 object-cover rounded-lg border border-gray-200"
            onError={onError}
          />
        </div>
      ) : (
        <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <p className="text-gray-500 text-center">
            Generate an image or upload one from your device
          </p>
        </div>
      )}
      
      <ImageFileUploader
        onImageChange={onImageChange}
        onUploadError={handleUploadError}
        disabled={disabled}
      />
    </div>
  );
};

export default ImageDisplay;

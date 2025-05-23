
import React from "react";
import ImageFileUploader from "./ImageFileUploader";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  onImageChange?: (base64DataUrl: string) => void;
  disabled?: boolean;
}

/**
 * Renders the image preview and file picker/upload button (using ImageFileUploader).
 * Surfaces file/image errors for easier diagnosis.
 */
const ImageDisplay = ({
  imageUrl,
  imageDataUrl,
  onError,
  onImageChange,
  disabled = false,
}: ImageDisplayProps) => {
  // Prefer imageDataUrl (from Supabase/upload) if valid and http/https URL
  let srcToShow: string | null = null;
  if (imageDataUrl && imageDataUrl.startsWith("http")) {
    srcToShow = imageDataUrl;
  } else if (imageUrl && imageUrl.startsWith("http")) {
    srcToShow = imageUrl;
  }

  return (
    <div className="mb-4">
      {srcToShow && (
        <img
          src={srcToShow}
          alt="Dream"
          className="w-full rounded-md aspect-square object-cover"
          onError={onError}
        />
      )}
      {!disabled && (
        <ImageFileUploader
          onImageChange={onImageChange}
          onUploadError={() => onError?.()}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default ImageDisplay;

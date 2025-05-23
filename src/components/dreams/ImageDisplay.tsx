
import React, { useRef } from "react";
import { useImageFileHandler } from "@/hooks/useImageFileHandler";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  onImageChange?: (base64DataUrl: string) => void;
  disabled?: boolean;
}

/**
 * Renders the image preview and file picker/upload button.
 * Handles file upload via a delegated hook for clarity.
 */
const ImageDisplay = ({
  imageUrl,
  imageDataUrl,
  onError,
  onImageChange,
  disabled = false,
}: ImageDisplayProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook to process files
  const {
    error: imageError,
    handleFileInput,
  } = useImageFileHandler({
    onImageChange,
    onError: (msg) => {
      // Pop error message upward, but fallback to parent handler for generic case
      onError?.();
    },
  });

  // Prefer imageDataUrl (from Supabase/upload) if valid and http/https URL
  let srcToShow: string | null = null;
  if (imageDataUrl && imageDataUrl.startsWith("http")) {
    srcToShow = imageDataUrl;
  } else if (imageUrl && !imageError && imageUrl.startsWith("http")) {
    srcToShow = imageUrl;
  }

  const handlePickLocalFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset so selecting the same file retriggers
      fileInputRef.current.click();
    }
  };

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
      {imageError && (
        <p className="text-xs text-red-500 mt-1 text-center">{imageError}</p>
      )}

      {!disabled && (
        <div className="flex flex-col items-center mt-2 gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded bg-dream-purple text-white hover:bg-dream-lavender transition"
            onClick={handlePickLocalFile}
            disabled={disabled}
          >
            Load Image from File
          </button>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInput}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;

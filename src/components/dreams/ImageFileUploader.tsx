
import React, { useRef } from "react";
import { useImageFileHandler } from "@/hooks/useImageFileHandler";

/**
 * Dream image file uploader.
 * Minimal UI: file picker + callback only.
 */
interface ImageFileUploaderProps {
  onImageChange?: (base64DataUrl: string) => void;
  onUploadError?: (errorMessage: string) => void;
  disabled?: boolean;
}

const ImageFileUploader: React.FC<ImageFileUploaderProps> = ({
  onImageChange,
  onUploadError,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleFileInput } = useImageFileHandler({
    onImageChange,
    onError: (msg) => {
      onUploadError?.(msg);
      // Error handling is callback + console log only; no UI.
    },
  });

  const handlePickLocalFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col w-full items-center gap-2">
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
  );
};

export default ImageFileUploader;

// File is now minimal, with all error logic handled in hooks and callback only (no UI).

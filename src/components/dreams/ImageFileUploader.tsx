
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
    try {
      if (fileInputRef.current) {
        // Clear previous value to ensure onChange fires even for same file
        fileInputRef.current.value = "";
        
        // Add error handling for iOS camera issues
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
          // On iOS, be more careful with camera access
          console.log("[ImageFileUploader] iOS detected, handling camera carefully");
          
          // Set up error handler before triggering file input
          const handleError = (error: any) => {
            console.error("[ImageFileUploader] iOS camera error:", error);
            onUploadError?.("Camera access failed. Please try selecting from photo library instead.");
          };
          
          // Add temporary error listener
          window.addEventListener('error', handleError, { once: true });
          
          // Clean up error listener after a delay
          setTimeout(() => {
            window.removeEventListener('error', handleError);
          }, 5000);
        }
        
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error("[ImageFileUploader] Error opening file picker:", error);
      onUploadError?.("Failed to open file picker. Please try again.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log("[ImageFileUploader] File input change triggered");
      handleFileInput(e);
    } catch (error) {
      console.error("[ImageFileUploader] Error handling file input:", error);
      onUploadError?.("Error processing selected file. Please try again.");
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
        accept="image/png,image/jpeg,image/jpg"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        disabled={disabled}
      />
    </div>
  );
};

export default ImageFileUploader;

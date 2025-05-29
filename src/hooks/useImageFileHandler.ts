
import { useState } from "react";

/**
 * Hook to handle image file reading and validation.
 * Returns: { error, handleFileInput }
 */
export function useImageFileHandler({
  onImageChange,
  onError,
}: {
  onImageChange?: (base64DataUrl: string) => void | Promise<void>;
  onError?: (errorMessage: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const reportError = (message: string, extra?: any) => {
    setError(message);
    onError?.(message);
    
    if (extra !== undefined) {
      console.error("[useImageFileHandler]", message, extra);
    } else {
      console.error("[useImageFileHandler]", message);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    console.log("[useImageFileHandler] File input triggered", file);
    
    if (!file) {
      reportError("No file selected.");
      return;
    }

    console.log("[useImageFileHandler] File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Check supported types
    if (!file.type.startsWith("image/")) {
      reportError("Selected file is not an image. Only PNG or JPG/JPEG allowed.", file.type);
      return;
    }

    // Check for HEIC file extension or type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt === "heic" || file.type === "image/heic") {
      reportError("HEIC and Apple Live Photos are not supported. Please select a PNG or JPG.", file.name);
      return;
    }

    // Convert file to data URL
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string" && reader.result.startsWith("data:image/")) {
        setError(null);
        console.log("[useImageFileHandler] File loaded successfully as base64. Length:", reader.result.length);
        
        if (onImageChange) {
          try {
            await onImageChange(reader.result);
            console.log("[useImageFileHandler] onImageChange callback completed successfully");
          } catch (err) {
            reportError("Error processing uploaded image.", err);
          }
        }
      } else {
        reportError("Could not read image file. File may be corrupted.", reader.result);
      }
    };

    reader.onerror = (ev) => {
      reportError("Error reading image file.", ev);
    };

    try {
      reader.readAsDataURL(file);
    } catch (err) {
      reportError("Error during file read operation.", err);
    }
  };

  return { error, handleFileInput };
}

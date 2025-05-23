
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

  // Helper for error reporting
  const reportError = (message: string, extra?: any) => {
    setError(message);
    onError?.(message);
    // Detailed log for dev
    if (extra !== undefined) {
      console.error("useImageFileHandler:", message, extra);
    } else {
      console.error("useImageFileHandler:", message);
    }
  };

  // Main file handler
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset error
    const file = e.target.files?.[0];
    if (!file) {
      reportError("No file selected.");
      return;
    }

    // Check supported types
    if (!file.type.startsWith("image/")) {
      reportError(
        "Selected file is not a supported image type. Only PNG or JPG are allowed.",
        file.type
      );
      return;
    }

    // Check for HEIC
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt === "heic" || file.type === "image/heic") {
      reportError(
        "HEIC images are not supported. Please select a PNG or JPEG photo.",
        file.name
      );
      return;
    }

    // Read the file as DataURL
    const reader = new FileReader();

    reader.onload = async () => {
      if (
        typeof reader.result === "string" &&
        reader.result.startsWith("data:image/")
      ) {
        setError(null);
        if (onImageChange) {
          try {
            await onImageChange(reader.result);
          } catch (err) {
            reportError("Something went wrong uploading your image.", err);
          }
        }
      } else {
        reportError(
          "Could not read file as image. The file may be corrupted or incompatible.",
          reader.result
        );
      }
    };

    reader.onerror = (ev) => {
      reportError("Error reading image file.", ev);
    };

    reader.readAsDataURL(file);
  };

  return { error, handleFileInput };
}

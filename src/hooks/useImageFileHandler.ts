
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

  // Extra deep log
  const reportError = (message: string, extra?: any) => {
    setError(message);
    onError?.(message);

    // Detailed log for dev
    if (extra !== undefined) {
      console.error("[useImageFileHandler]", message, extra);
    } else {
      console.error("[useImageFileHandler]", message);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset error
    const file = e.target.files?.[0];
    console.log("[useImageFileHandler] file input triggered", file);
    if (!file) {
      reportError("No file selected.");
      return;
    }

    // Log file type and name
    console.log("[useImageFileHandler] Detected file: ", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Check supported types
    if (!file.type.startsWith("image/")) {
      reportError(
        "Selected file is not an image. Only PNG or JPG/JPEG allowed.",
        file.type
      );
      return;
    }

    // Check for HEIC file extension or type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt === "heic" || file.type === "image/heic") {
      reportError(
        "HEIC and Apple Live Photos are not supported. Please select a PNG or JPG.",
        file.name
      );
      return;
    }

    // Try reading file as DataURL
    const reader = new FileReader();
    reader.onload = async () => {
      if (
        typeof reader.result === "string" &&
        reader.result.startsWith("data:image/")
      ) {
        setError(null);
        console.log("[useImageFileHandler] File loaded as base64 DataURL. Length: ", reader.result.length, " Preview: ", reader.result.slice(0, 40));
        if (onImageChange) {
          try {
            await onImageChange(reader.result);
            console.log("[useImageFileHandler] onImageChange callback finished successfully.");
          } catch (err) {
            reportError("Error uploading image from file.", err);
          }
        }
      } else {
        reportError(
          "File read error: could not decode as image. Corrupted or unsupported.",
          reader.result
        );
      }
    };

    reader.onerror = (ev) => {
      reportError("Error reading image file (reader.onerror).", ev);
    };

    try {
      reader.readAsDataURL(file);
    } catch(err) {
      reportError("Error during file read as data URL.", err);
    }
  };

  return { error, handleFileInput };
}

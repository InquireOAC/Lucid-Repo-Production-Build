
import React, { useState, useRef } from "react";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  onImageChange?: (base64DataUrl: string) => void;
  disabled?: boolean;
}

const ImageDisplay = ({
  imageUrl,
  imageDataUrl,
  onError,
  onImageChange,
  disabled = false,
}: ImageDisplayProps) => {
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = () => {
    setImageError("There was an issue displaying the image.");
    console.error("ImageDisplay: Error showing image");
    onError();
  };

  const handlePickLocalFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageError("No file selected.");
      console.error("ImageDisplay: No file selected.");
      onError();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError(
        "Selected file is not a supported image type. Only PNG or JPG are allowed."
      );
      console.error("ImageDisplay: Selected file not image type", file.type);
      onError();
      return;
    }

    // On iOS devices, .heic is common but not supported by most web/CAP APIs
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt === "heic" || file.type === "image/heic") {
      setImageError(
        "HEIC images are not supported. Please select a PNG or JPEG photo."
      );
      console.error(
        "ImageDisplay: .heic file selected, not supported by browser nor Capacitor."
      );
      onError();
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (
        typeof reader.result === "string" &&
        reader.result.startsWith("data:image/")
      ) {
        setImageError(null);
        console.log(
          "ImageDisplay: Successfully read image as data URL",
          reader.result.slice(0, 40),
          "... (truncated)"
        );
        if (onImageChange) {
          try {
            await onImageChange(reader.result);
          } catch (err) {
            setImageError("Something went wrong uploading your image.");
            console.error("ImageDisplay: onImageChange error", err);
            onError();
          }
        }
      } else {
        setImageError("Could not read file as image.");
        console.error("ImageDisplay: result not an image data URL", reader.result);
        onError();
      }
    };
    reader.onerror = (error) => {
      setImageError("Error reading image file.");
      console.error("ImageDisplay: FileReader error", error);
      onError();
    };
    reader.readAsDataURL(file);
  };

  // Prefer imageDataUrl if given
  let srcToShow: string | null = null;
  if (imageDataUrl && imageDataUrl.startsWith("http")) {
    srcToShow = imageDataUrl;
  } else if (imageUrl && !imageError && imageUrl.startsWith("http")) {
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
        <p className="text-xs text-red-500 mt-1 text-center">{imageError}</p>
      )}

      {/* The upload button is ALWAYS present if not disabled */}
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
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;

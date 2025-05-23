import React, { useState, useRef } from "react";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  onImageChange?: (base64DataUrl: string) => void; // Optional, but always show
  disabled?: boolean;
}

const ImageDisplay = ({
  imageUrl,
  imageDataUrl,
  onError,
  onImageChange,
  disabled = false,
}: ImageDisplayProps) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = () => {
    setImageError(true);
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
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string" && reader.result.startsWith("data:image/")) {
          setImageError(false);
          console.log("ImageDisplay: Successfully read image as data URL", reader.result.slice(0, 40), "... (truncated)");
          if (onImageChange) {
            try {
              await onImageChange(reader.result); // Pass base64 to hook, which persists to Supabase and updates state
            } catch (err) {
              setImageError(true);
              console.error("ImageDisplay: onImageChange threw error", err);
              onError();
            }
          }
        } else {
          setImageError(true);
          console.error("ImageDisplay: Could not read file as image data URL, result:", reader.result);
          onError();
        }
      };
      reader.onerror = (error) => {
        setImageError(true);
        console.error("ImageDisplay: FileReader error", error);
        onError();
      };
      reader.readAsDataURL(file);
    } else {
      setImageError(true);
      console.error("ImageDisplay: Selected file not image type or missing", file);
      onError();
    }
  };

  // Prioritize URLs from Supabase/PNG (imageDataUrl)
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
        <p className="text-xs text-red-500 mt-1 text-center">
          There was an issue displaying the image.
        </p>
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

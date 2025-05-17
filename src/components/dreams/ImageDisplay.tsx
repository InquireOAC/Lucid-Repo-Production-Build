import React, { useState, useRef } from "react";

interface ImageDisplayProps {
  imageUrl: string;
  imageDataUrl?: string;
  onError: () => void;
  onImageChange?: (base64DataUrl: string) => void; // New, optional
}

const ImageDisplay = ({
  imageUrl,
  imageDataUrl,
  onError,
  onImageChange,
}: ImageDisplayProps) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
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
      // Always convert to base64 first and pass that to onImageChange for upload
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string" && reader.result.startsWith("data:image/")) {
          setImageError(false);
          if (onImageChange) {
            await onImageChange(reader.result); // Now, onImageChange uploads and returns publicUrl
          }
        } else {
          setImageError(true);
          onError();
        }
      };
      reader.onerror = (error) => {
        setImageError(true);
        onError();
      };
      reader.readAsDataURL(file);
    } else {
      setImageError(true);
      onError();
    }
  };

  // Display only URL: prioritize normal URLs (png from Supabase) over base64s
  let srcToShow = null;
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
        <div className="flex flex-col items-center mt-2 gap-2">
          <p className="text-xs text-red-500">
            There was an issue displaying the image.
          </p>
          <button
            type="button"
            className="px-3 py-1 rounded bg-dream-purple text-white hover:bg-dream-lavender transition"
            onClick={handlePickLocalFile}
          >
            Load Image from File
          </button>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;

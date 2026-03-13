
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UseImageFileUploadProps {
  dreamId?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  imagePrompt: string;
}

export const useImageFileUpload = ({
  dreamId = "preview",
  onImageGenerated,
  imagePrompt,
}: UseImageFileUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageFromFile = async (
    fileDataUrl: string,
    uploadImage: (url: string, dreamId: string) => Promise<string | null>,
    setImageError: (error: boolean) => void
  ) => {
    console.log("handleImageFromFile triggered with file");
    if (!fileDataUrl || !user) {
      setImageError(true);
      console.error("Could not add image. Please try again.");
      return;
    }
    setIsUploading(true);
    setImageError(false);
    
    try {
      console.log("Converting file data URL to blob for upload...");
      const response = await fetch(fileDataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log("Created blob URL for upload:", blobUrl);
      
      const publicUrl = await uploadImage(blobUrl, dreamId);
      URL.revokeObjectURL(blobUrl);
      
      if (!publicUrl) {
        console.warn("Upload failed, using local fallback");
        setImageError(true);
        onImageGenerated(fileDataUrl, imagePrompt || "Uploaded image");
      } else {
        console.log("File uploaded successfully to:", publicUrl);
        onImageGenerated(publicUrl, imagePrompt || "Uploaded image");
      }
    } catch (error) {
      console.error("File upload error:", error);
      setImageError(true);
      onImageGenerated(fileDataUrl, imagePrompt || "Uploaded image");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleImageFromFile,
  };
};

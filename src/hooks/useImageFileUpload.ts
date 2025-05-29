
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
      toast.error("Could not add image. Please try again.");
      return;
    }
    setIsUploading(true);
    setImageError(false);
    
    try {
      console.log("Converting file data URL to blob for upload...");
      // Convert data URL to blob
      const response = await fetch(fileDataUrl);
      const blob = await response.blob();
      
      // Create object URL from blob for upload
      const blobUrl = URL.createObjectURL(blob);
      console.log("Created blob URL for upload:", blobUrl);
      
      // Use reliable upload with blob URL
      const publicUrl = await uploadImage(blobUrl, dreamId);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
      
      if (!publicUrl) {
        console.warn("Upload failed, using local fallback");
        setImageError(true);
        onImageGenerated(fileDataUrl, imagePrompt || "Uploaded image");
        toast.warning("Failed to upload image permanently. Using local version - please save manually if needed.");
      } else {
        console.log("File uploaded successfully to:", publicUrl);
        onImageGenerated(publicUrl, imagePrompt || "Uploaded image");
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("File upload error:", error);
      setImageError(true);
      onImageGenerated(fileDataUrl, imagePrompt || "Uploaded image");
      toast.warning("Upload error, but image is available locally. Please save manually if needed.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleImageFromFile,
  };
};

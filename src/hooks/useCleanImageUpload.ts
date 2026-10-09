
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToStorage, urlToBlob } from "@/utils/cleanImageUpload";

export const useCleanImageUpload = () => {
  const { user } = useAuth();

  const uploadImageData = async (imageData: Blob | File, dreamId: string = "preview"): Promise<string | null> => {
    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    try {
      console.log("Starting upload process with raw image data");
      const uploadedUrl = await uploadImageToStorage(imageData, user.id, dreamId);
      
      if (!uploadedUrl) {
        throw new Error("No URL returned from upload");
      }
      
      console.log("Upload completed successfully:", uploadedUrl);
      return uploadedUrl;
    } catch (error: any) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const uploadImageFromUrl = async (imageUrl: string, dreamId: string = "preview"): Promise<string | null> => {
    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    try {
      console.log("Converting URL to blob then uploading");
      const imageBlob = await urlToBlob(imageUrl);
      return await uploadImageData(imageBlob, dreamId);
    } catch (error: any) {
      console.error("URL upload failed:", error);
      return null;
    }
  };

  return { uploadImageData, uploadImageFromUrl };
};

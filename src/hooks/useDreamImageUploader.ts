
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

export const useDreamImageUploader = () => {
  const { user } = useAuth();

  const uploadAndGetPublicImageUrl = async (image: string, prompt: string, dreamId: string) => {
    if (!user) {
      throw new Error("Not logged in; cannot upload images.");
    }
    
    try {
      console.log("Starting upload process for user:", user.id, "dreamId:", dreamId);
      const uploadedUrl = await uploadImageToSupabase(image, user.id, dreamId);
      
      if (!uploadedUrl || !uploadedUrl.startsWith("http")) {
        throw new Error("Failed to get valid upload URL");
      }
      
      console.log("Upload completed successfully:", uploadedUrl);
      return uploadedUrl;
    } catch (error: any) {
      console.error("Upload failed:", error);
      // More specific error messages
      if (error.message.includes("Failed to fetch image")) {
        throw new Error("Unable to download the generated image. The image URL may have expired.");
      } else if (error.message.includes("Upload failed")) {
        throw new Error("Failed to save image to storage. Please check your connection and try again.");
      } else {
        throw new Error(`Upload failed: ${error?.message || "Unknown error"}`);
      }
    }
  };

  return { uploadAndGetPublicImageUrl };
};


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
      console.log("Starting upload process...");
      const uploadedUrl = await uploadImageToSupabase(image, user.id, dreamId);
      
      if (!uploadedUrl || !uploadedUrl.startsWith("http")) {
        throw new Error("Failed to get valid upload URL");
      }
      
      console.log("Upload completed successfully:", uploadedUrl);
      return uploadedUrl;
    } catch (error: any) {
      console.error("Upload failed:", error);
      throw new Error(`Upload failed: ${error?.message || "Unknown error"}`);
    }
  };

  return { uploadAndGetPublicImageUrl };
};

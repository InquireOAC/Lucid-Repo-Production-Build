
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToStorage } from "@/utils/cleanImageUpload";
import { toast } from "sonner";

export const useCleanImageUpload = () => {
  const { user } = useAuth();

  const uploadImage = async (imageUrl: string, dreamId: string = "preview"): Promise<string | null> => {
    if (!user) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      console.log("Starting upload process with clean uploader");
      const uploadedUrl = await uploadImageToStorage(imageUrl, user.id, dreamId);
      
      if (!uploadedUrl) {
        throw new Error("No URL returned from upload");
      }
      
      console.log("Upload completed successfully:", uploadedUrl);
      return uploadedUrl;
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
  };

  return { uploadImage };
};

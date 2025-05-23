
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

export const useDreamImageUploader = () => {
  const { user } = useAuth();

  const uploadAndGetPublicImageUrl = async (image: string, prompt: string, dreamId: string) => {
    if (!user) {
      toast.error("Not logged in; cannot upload images.");
      return "";
    }
    try {
      const uploadedUrl = await uploadImageToSupabase(image, user.id, dreamId);
      if (!uploadedUrl || !uploadedUrl.startsWith("http")) {
        toast.error("Problem uploading image. Please try again.");
        return "";
      }
      return uploadedUrl;
    } catch (error: any) {
      toast.error("Upload failed: " + (error?.message || "Unknown error"));
      return "";
    }
  };

  return { uploadAndGetPublicImageUrl };
};

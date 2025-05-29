
import { useAuth } from "@/contexts/AuthContext";
import { reliableImageUpload } from "@/utils/reliableImageUpload";
import { toast } from "sonner";

export const useReliableImageUpload = () => {
  const { user } = useAuth();

  const uploadImage = async (imageUrl: string, dreamId: string = "preview"): Promise<string | null> => {
    if (!user) {
      console.error("No user found for image upload");
      toast.error("User not authenticated");
      return null;
    }

    console.log("Starting upload with user:", user.id);
    
    try {
      const result = await reliableImageUpload(imageUrl, user.id, dreamId);
      
      if (result) {
        console.log("Upload successful, result:", result);
        toast.success("Image uploaded successfully!");
        return result;
      } else {
        console.error("Upload returned null");
        toast.error("Upload failed - no result returned");
        return null;
      }
    } catch (error) {
      console.error("Upload hook error:", error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  return { uploadImage };
};

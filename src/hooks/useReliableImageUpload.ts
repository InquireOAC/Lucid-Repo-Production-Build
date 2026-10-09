
import { useAuth } from "@/contexts/AuthContext";
import { reliableImageUpload } from "@/utils/reliableImageUpload";

export const useReliableImageUpload = () => {
  const { user } = useAuth();

  const uploadImage = async (imageUrl: string, dreamId: string = "preview"): Promise<string | null> => {
    if (!user) {
      console.error("No user found for image upload");
      return null;
    }

    console.log("Starting upload with user:", user.id);
    
    try {
      const result = await reliableImageUpload(imageUrl, user.id, dreamId);
      
      if (result) {
        console.log("Upload successful, result:", result);
        return result;
      } else {
        console.error("Upload returned null");
        return null;
      }
    } catch (error) {
      console.error("Upload hook error:", error);
      return null;
    }
  };

  return { uploadImage };
};

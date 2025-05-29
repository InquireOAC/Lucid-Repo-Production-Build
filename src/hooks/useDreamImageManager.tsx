
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { uploadDreamImage } from "@/utils/imageUtils"; // Existing utility

export const useDreamImageManager = () => {
  const uploadAndLinkImage = async (
    dreamId: string, // Can be "preview" or actual dreamId
    imageUrl: string,
    userId: string | undefined
  ): Promise<string | null> => {
    if (!userId) {
      console.error("User ID is required for image upload.");
      // Consider toasting an error here if appropriate for user feedback
      return null; 
    }
    return uploadDreamImage(dreamId, imageUrl, userId);
  };

  const deleteManagedImage = async (imageUrl: string | null | undefined): Promise<void> => {
    if (!imageUrl) return;

    // Update to use the new dreamimages bucket URL
    const baseSupabaseStorageUrl = `${SUPABASE_URL}/storage/v1/object/public/dreamimages/`;
    
    if (imageUrl.startsWith(baseSupabaseStorageUrl)) {
      try {
        const imagePath = imageUrl.substring(baseSupabaseStorageUrl.length);
        if (imagePath) {
          console.log("Deleting associated image from Supabase storage:", imagePath);
          const { error } = await supabase.storage.from("dreamimages").remove([imagePath]);
          if (error) {
            console.error("Error deleting image from storage:", error.message);
            // Optionally re-throw or toast
          } else {
            console.log("Deleted associated image:", imagePath);
          }
        }
      } catch (imageError: any) {
        console.error("Error during image deletion attempt:", imageError.message);
      }
    }
  };

  return { uploadAndLinkImage, deleteManagedImage };
};

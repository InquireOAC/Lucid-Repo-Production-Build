
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Uploads a dream image to Supabase storage and updates the dream entry
 * @param dreamId The ID of the dream to update
 * @param imageUrl URL of the image to upload
 * @returns The public URL of the uploaded image
 */
export const uploadDreamImage = async (dreamId: string, imageUrl: string): Promise<string | null> => {
  try {
    if (!dreamId || !imageUrl) {
      console.error("Missing required parameters for image upload");
      return null;
    }

    console.log("Starting image upload process for dream:", dreamId);
    
    // 1. Fetch the image as a blob
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const imageBlob = await response.blob();
    
    // 2. Generate a unique filename
    const fileName = `dream-${dreamId}-${Date.now()}.jpg`;
    const filePath = `${fileName}`;
    
    console.log("Uploading image to storage:", filePath);
    
    // 3. Upload the blob to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dreamimage')
      .upload(filePath, imageBlob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload successful:", uploadData);
    
    // 4. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('dreamimage')
      .getPublicUrl(filePath);
      
    console.log("Public URL generated:", publicUrl);
    
    // 5. Update the dream entry with the image URL
    const { error: updateError } = await supabase
      .from("dream_entries")
      .update({ 
        image_url: publicUrl,
        generatedImage: publicUrl // Update both fields for compatibility
      })
      .eq("id", dreamId);
      
    if (updateError) {
      console.error("Failed to update dream with image URL:", updateError);
      throw updateError;
    }
    
    console.log("Dream entry updated with permanent image URL");
    return publicUrl;
    
  } catch (error) {
    console.error("Error in uploadDreamImage:", error);
    toast.error("Failed to save dream image permanently");
    return null;
  }
};

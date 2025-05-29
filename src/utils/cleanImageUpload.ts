
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Clean, simple image upload utility for AI-generated images
 * Fetches from external URL and uploads to Supabase Storage
 */
export const uploadImageToStorage = async (
  imageUrl: string,
  userId: string,
  dreamId: string = "preview"
): Promise<string | null> => {
  try {
    console.log("Starting clean image upload:", { imageUrl, userId, dreamId });

    // 1. Fetch the image data from the external URL
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    console.log("Image blob fetched:", imageBlob.size, "bytes, type:", imageBlob.type);

    if (imageBlob.size === 0) {
      throw new Error("Image blob is empty");
    }

    // 2. Create file path
    const timestamp = Date.now();
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;

    // 3. Upload to Supabase Storage
    console.log("Uploading to dreamimages bucket at path:", filePath);
    const { data, error } = await supabase.storage
      .from("dreamimages")
      .upload(filePath, imageBlob, {
        cacheControl: "public, max-age=31536000",
        upsert: true,
        contentType: imageBlob.type || "image/png",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("Upload successful:", data);

    // 4. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("dreamimages")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    console.log("Public URL generated:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Clean image upload error:", error);
    throw error;
  }
};

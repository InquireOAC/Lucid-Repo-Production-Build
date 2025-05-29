
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Clean, simple image upload utility for raw image data
 * Uploads Blob/File data directly to Supabase Storage
 */
export const uploadImageToStorage = async (
  imageData: Blob | File,
  userId: string,
  dreamId: string = "preview"
): Promise<string | null> => {
  try {
    console.log("Starting clean image upload with raw data:", { 
      size: imageData.size, 
      type: imageData.type, 
      userId, 
      dreamId 
    });

    if (imageData.size === 0) {
      throw new Error("Image data is empty");
    }

    // Create file path
    const timestamp = Date.now();
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;

    // Upload to Supabase Storage
    console.log("Uploading to dreamimages bucket at path:", filePath);
    const { data, error } = await supabase.storage
      .from("dreamimages")
      .upload(filePath, imageData, {
        cacheControl: "public, max-age=31536000",
        upsert: true,
        contentType: imageData.type || "image/png",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("Upload successful:", data);

    // Get public URL
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

/**
 * Convert image URL to Blob for upload
 */
export const urlToBlob = async (imageUrl: string): Promise<Blob> => {
  try {
    console.log("Converting URL to blob:", imageUrl);

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log("URL converted to blob:", blob.size, "bytes, type:", blob.type);

    if (blob.size === 0) {
      throw new Error("Converted blob is empty");
    }

    return blob;

  } catch (error) {
    console.error("URL to blob conversion error:", error);
    throw error;
  }
};

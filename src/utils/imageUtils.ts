
// src/utils/imageUtils.ts
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Uploads a dream image to Supabase storage and updates the dream entry
 * @param dreamId The ID of the dream to update, or "preview" for temporary uploads
 * @param imageUrl URL of the image to upload (can be OpenAI URL or existing Supabase URL)
 * @param userId The ID of the user uploading the image
 * @returns The permanent public URL of the uploaded image, or null on failure
 */
export const uploadDreamImage = async (
  dreamId: string,
  imageUrl: string,
  userId: string | undefined
): Promise<string | null> => {
  try {
    if (!imageUrl) {
      console.error("Missing image URL for upload");
      return null;
    }

    if (!userId) {
      console.error("Missing userId for image upload. User might not be logged in.");
      toast.error("User not identified. Cannot save image to your account.");
      return imageUrl; 
    }

    console.log(`Starting image upload for dream: ${dreamId}, user: ${userId}`);

    const baseSupabaseStorageUrl = `${SUPABASE_URL}/storage/v1/object/public/dreamimages/`;

    // 1. If it's already a Supabase public URL from our dreamimages bucket, return it directly
    if (imageUrl.startsWith(baseSupabaseStorageUrl)) {
      console.log("Image is already in Supabase dreamimages bucket, returning existing URL");
      return imageUrl;
    }

    // 2. Fetch the remote image (e.g., from OpenAI)
    console.log("Fetching image from URL:", imageUrl);
    const response = await fetch(imageUrl, {
      cache: "no-cache", // Avoid caching issues with temporary URLs
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log("Image blob created, size:", blob.size);
    
    if (blob.size === 0) {
      throw new Error("Image blob is empty, cannot upload.");
    }

    // 3. Create a unique file path with timestamp, incorporating userId
    const timestamp = Date.now();
    let filePath: string;

    if (dreamId === "preview") {
      filePath = `${userId}/previews/${timestamp}.png`;
    } else {
      filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;
    }

    // 4. Upload to Supabase storage with correct bucket name "dreamimages"
    console.log("Uploading to Supabase storage path:", filePath, "in bucket dreamimages");
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("dreamimages") // Updated bucket name
      .upload(filePath, blob, {
        contentType: "image/png",
        upsert: true, 
        cacheControl: "3600", 
      });
      
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    // 5. Get the public URL
    const { data } = supabase.storage
      .from("dreamimages") // Updated bucket name
      .getPublicUrl(filePath);
    
    const publicUrl = data.publicUrl;
    console.log("Public URL from Supabase:", publicUrl);

    // 6. Update the dream entry with the permanent URL if not a preview
    if (dreamId !== "preview" && dreamId) { 
      console.log("Updating dream entry in database with image URL:", publicUrl);
      const { error: dbError } = await supabase
        .from("dream_entries")
        .update({ 
          generatedImage: publicUrl,
          image_url: publicUrl 
        })
        .eq("id", dreamId)
        .eq("user_id", userId); 
      
      if (dbError) {
        console.error("Error updating dream entry in database:", dbError);
      }
    }

    return publicUrl;
  } catch (error: any) {
    console.error("Error in uploadDreamImage:", error.message, error.stack);
    toast.error(`Failed to save image: ${error.message}. Using temporary image for now.`);
    return imageUrl; 
  }
};

/**
 * Helper function to convert a URL to a data URL for better persistence
 * @param url The image URL to convert
 * @returns A promise that resolves to a data URL
 */
export const urlToDataURL = async (url: string): Promise<string> => {
  try {
    if (!url) return "";
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to data URL:", error);
    return url;
  }
};

/**
 * Helper function to convert a temporary URL to a persistent URL
 * @param url The image URL to check
 * @returns The original URL or a cached version if needed
 */
export const persistImageURL = async (url: string): Promise<string> => {
  try {
    if (!url) return "";
    
    const baseSupabaseStorageUrl = `${SUPABASE_URL}/storage/v1/object/public/`;
    // If already a Supabase URL (from any bucket, though dreamimages is primary), it should be persistent
    if (url.startsWith(baseSupabaseStorageUrl)) {
      return url;
    }
    
    // For external URLs like OpenAI's temporary URLs, convert to data URL
    const dataUrl = await urlToDataURL(url);
    return dataUrl || url;
  } catch (error) {
    console.error("Error persisting image URL:", error);
    return url || "";
  }
};

/**
 * Preloads an image into the browser cache
 * @param url The image URL to preload
 */
export const preloadImage = (url: string): void => {
  if (!url) return;
  const img = new Image();
  img.src = url;
};

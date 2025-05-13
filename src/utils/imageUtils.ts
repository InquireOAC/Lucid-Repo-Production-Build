
// src/utils/imageUtils.ts
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Uploads a dream image to Supabase storage and updates the dream entry
 * @param dreamId The ID of the dream to update
 * @param imageUrl URL of the image to upload
 * @returns The permanent public URL of the uploaded image, or null on failure
 */
export const uploadDreamImage = async (
  dreamId: string,
  imageUrl: string
): Promise<string | null> => {
  try {
    if (!dreamId || !imageUrl) {
      console.error("Missing required parameters for image upload");
      return null;
    }

    console.log("Starting image upload for dream:", dreamId);

    // 1. If it's already a Supabase public URL, skip upload
    if (
      imageUrl.includes("supabase.co") &&
      imageUrl.includes("/storage/v1/object/public/")
    ) {
      console.log("Image is already in Supabase, skipping upload");
      return imageUrl;
    }

    // 2. Fetch the remote image as a Blob
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();

    // 3. Define a storage path in 'generated_dream_images' bucket
    const filePath = `dreams/${dreamId}.png`;

    // 4. Upload the blob
    const { error: uploadError } = await supabase.storage
      .from("generated_dream_images")
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true,
      });
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    console.log("Upload successful:", filePath);

    // 5. Get the permanent public URL
    const { data } = supabase.storage
      .from("generated_dream_images")
      .getPublicUrl(filePath);
    
    if (!data || !data.publicUrl) {
      console.error("Error getting public URL: No URL returned");
      throw new Error("Failed to get public URL");
    }
    
    const publicUrl = data.publicUrl;
    console.log("Public URL:", publicUrl);

    // 6. Persist the URL in your DB
    if (dreamId !== "preview") {
      const { error: dbError } = await supabase
        .from("dream_entries")
        .update({ 
          generatedImage: publicUrl,
          image_url: publicUrl 
        })
        .eq("id", dreamId);
      if (dbError) {
        console.error("Error updating dream entry:", dbError);
      } else {
        console.log("Dream entry updated with image URL");
      }
    }

    return publicUrl;
  } catch (error: any) {
    console.error("Error in uploadDreamImage:", error);
    toast.error("Failed to save image, please try again");
    return null;
  }
};

/**
 * Helper function to convert a temporary URL to a persistent blob URL
 * @param url The image URL to persist
 * @returns A persistent blob URL (or original URL on error)
 */
export const persistImageURL = async (url: string): Promise<string> => {
  try {
    if (!url || url.includes("supabase.co")) {
      return url;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error persisting image URL:", error);
    return url;
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

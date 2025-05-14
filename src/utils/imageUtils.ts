
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

    // 1. If it's already a Supabase public URL, return it directly
    if (
      imageUrl.includes("supabase.co") &&
      imageUrl.includes("/storage/v1/object/public/")
    ) {
      console.log("Image is already in Supabase, returning existing URL");
      return imageUrl;
    }

    // 2. Fetch the remote image
    console.log("Fetching image from URL:", imageUrl);
    const response = await fetch(imageUrl, {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache"
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`);
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log("Image blob created, size:", blob.size);
    
    if (blob.size === 0) {
      throw new Error("Image blob is empty");
    }

    // 3. Create a unique file path with timestamp
    const timestamp = Date.now();
    const filePath = `dreams/${dreamId}-${timestamp}.png`;

    // 4. Upload to Supabase storage
    console.log("Uploading to Supabase storage path:", filePath);
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("dream_images")
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
      .from("dream_images")
      .getPublicUrl(filePath);
    
    const publicUrl = data.publicUrl;
    console.log("Public URL:", publicUrl);

    // 6. Update the dream entry with the permanent URL if not a preview
    if (dreamId !== "preview") {
      console.log("Updating dream entry with image URL:", publicUrl);
      const { error: dbError } = await supabase
        .from("dream_entries")
        .update({ 
          generatedImage: publicUrl,
          image_url: publicUrl 
        })
        .eq("id", dreamId);
      
      if (dbError) {
        console.error("Error updating dream entry:", dbError);
      }
    }

    return publicUrl;
  } catch (error: any) {
    console.error("Error in uploadDreamImage:", error);
    toast.error("Failed to save image permanently");
    // Return the original URL as fallback
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
    
    // If already a Supabase URL, it should be persistent
    if (url.includes("supabase.co") && url.includes("/storage/v1/object/public/")) {
      return url;
    }
    
    // For external URLs like OpenAI's temporary URLs, convert to data URL
    // This makes the image persist in memory even if the original URL expires
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

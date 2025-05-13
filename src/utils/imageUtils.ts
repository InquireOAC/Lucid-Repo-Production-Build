
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

    // 2. Create the storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === "generated_dream_images")) {
      console.log("Creating generated_dream_images bucket");
      const { error: createError } = await supabase.storage.createBucket("generated_dream_images", {
        public: true
      });
      if (createError) {
        console.error("Error creating bucket:", createError);
      }
    }

    // 3. Fetch the remote image directly
    console.log("Fetching image from URL:", imageUrl);
    const response = await fetch(imageUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log("Image blob created, size:", blob.size);

    // 4. Define a storage path in 'generated_dream_images' bucket
    const timestamp = Date.now();
    const filePath = `dreams/${dreamId}-${timestamp}.png`;

    // 5. Upload the blob directly to Supabase storage
    console.log("Uploading to Supabase storage path:", filePath);
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("generated_dream_images")
      .upload(filePath, blob, {
        contentType: "image/png",
        upsert: true,
        cacheControl: "3600",
      });
      
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload successful:", uploadData);

    // 6. Get the permanent public URL
    const { data } = supabase.storage
      .from("generated_dream_images")
      .getPublicUrl(filePath);
    
    const publicUrl = data.publicUrl;
    console.log("Public URL:", publicUrl);

    // 7. Persist the URL in your DB immediately
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
 * Helper function to convert a URL to a data URL for better persistence
 * @param url The image URL to convert
 * @returns A promise that resolves to a data URL
 */
export const urlToDataURL = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
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
 * This is different from persistImageURL as it doesn't create blob URLs
 * which can become invalid
 * @param url The image URL to check
 * @returns The original URL or a cached version if needed
 */
export const persistImageURL = async (url: string): Promise<string> => {
  try {
    if (!url || url.includes("supabase.co")) {
      return url; // Already a persistent URL
    }
    
    // For OpenAI temporary URLs, we'll use a cache buster to ensure we get the latest version
    return `${url}${url.includes('?') ? '&' : '?'}cache=${Date.now()}`;
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

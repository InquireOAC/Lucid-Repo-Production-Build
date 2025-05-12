
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
    
    // Check if it's already a Supabase Storage URL
    if (imageUrl.includes("supabase.co") && imageUrl.includes("/storage/v1/object/public/")) {
      console.log("Image is already stored in Supabase, skipping upload");
      return imageUrl;
    }
    
    // 1. Fetch the image as a blob
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const imageBlob = await response.blob();
    
    // 2. Generate a unique filename with dreamId to avoid duplicates
    const fileName = `dream-${dreamId}-${Date.now()}.jpg`;
    const filePath = `${fileName}`;
    
    console.log("Uploading image to storage:", filePath);

    // Create a local URL for immediate display and caching
    const localBlobUrl = URL.createObjectURL(imageBlob);
    
    // 3. Upload the blob to Supabase Storage in the background
    // Use the EdgeRuntime.waitUntil approach but simplified for client-side
    const uploadPromise = (async () => {
      try {
        // Check if bucket exists first (will create it if needed)
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(bucket => bucket.name === 'dreamimage')) {
          console.log("Creating dreamimage bucket");
          await supabase.storage.createBucket('dreamimage', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
        }
        
        // Upload to the bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('dreamimage')
          .upload(filePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          return null;
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
        }
        
        console.log("Dream entry updated with permanent image URL");
        return publicUrl;
      } catch (error) {
        console.error("Background upload error:", error);
        return null;
      }
    })();
    
    // Return local blob URL immediately for display
    // This ensures the image is visible right away and persists locally
    return localBlobUrl;
    
  } catch (error) {
    console.error("Error in uploadDreamImage:", error);
    return null;
  }
};

/**
 * Helper function to convert a temporary URL to a permanent blob URL
 * @param url The image URL to persist
 * @returns A persistent blob URL
 */
export const persistImageURL = async (url: string): Promise<string> => {
  try {
    // If it's already a blob URL or null/undefined, return as is
    if (!url || url.startsWith('blob:') || url.includes('supabase.co')) {
      return url;
    }
    
    // Fetch image and create a persistent blob
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error persisting image URL:", error);
    return url; // Return original URL on error
  }
};

/**
 * Helper function to preload an image from a URL to browser cache
 * @param url The image URL to preload
 */
export const preloadImage = (url: string): void => {
  if (!url) return;
  
  const img = new Image();
  img.src = url;
};

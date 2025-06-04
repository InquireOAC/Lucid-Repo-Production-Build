
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Upload an image to Supabase Storage and convert to PNG if needed
 * @param dataUrlOrUrl - base64 image DataURL or remote image URL
 * @param userId - user's unique ID
 * @param dreamId - dream ID (use for permanent storage, otherwise "preview")
 * @returns public URL to the uploaded file
 */
export const uploadImageToSupabase = async (
  dataUrlOrUrl: string,
  userId: string,
  dreamId: string = "preview"
): Promise<string | null> => {
  try {
    console.log("uploadImageToSupabase called with:", { 
      dataUrlType: dataUrlOrUrl.startsWith("data:") ? "data URL" : "remote URL",
      userId, 
      dreamId 
    });
    
    // Check if it's already a Supabase URL from dream-images bucket
    const baseDreamImagesUrl = `${SUPABASE_URL}/storage/v1/object/public/dream-images/`;
    if (dataUrlOrUrl.startsWith(baseDreamImagesUrl)) {
      console.log("Image is already in Supabase dream-images bucket, returning existing URL");
      return dataUrlOrUrl;
    }

    let pngBlob: Blob;

    if (dataUrlOrUrl.startsWith("data:image/")) {
      // Convert base64 DataURL to Blob
      console.log("Converting data URL to blob");
      const response = await fetch(dataUrlOrUrl);
      if (!response.ok) {
        throw new Error(`Failed to convert data URL: ${response.status}`);
      }
      pngBlob = await response.blob();
      console.log("Data URL converted to blob:", pngBlob.size, "bytes");
    } else if (dataUrlOrUrl.startsWith("http")) {
      // For remote URLs (like OpenAI), use the dedicated edge function
      console.log("Using edge function for remote URL upload:", dataUrlOrUrl);
      
      const { data, error } = await supabase.functions.invoke('upload-openai-image', {
        body: {
          imageUrl: dataUrlOrUrl,
          userId: `${userId}/dreams/${dreamId}`
        }
      });

      if (error) {
        console.error("Edge function upload error:", error);
        throw new Error(`Upload function failed: ${error.message}`);
      }

      if (!data?.success || !data?.publicUrl) {
        console.error("Upload function returned invalid response:", data);
        throw new Error("Upload function did not return a valid URL");
      }

      console.log("Edge function upload successful:", data.publicUrl);
      return data.publicUrl;
    } else {
      throw new Error("Unsupported image format for upload");
    }

    if (!pngBlob || pngBlob.size === 0) {
      throw new Error("Generated PNG blob is empty");
    }

    // Create storage path for local blob uploads
    const timestamp = Date.now();
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;

    console.log("Uploading PNG to Supabase storage (dream-images bucket):", filePath, "Size:", pngBlob.size, "bytes");
    
    // Upload to Supabase storage using the dream-images bucket
    const { data, error } = await supabase.storage
      .from("dream-images")
      .upload(filePath, pngBlob, {
        cacheControl: "public, max-age=31536000",
        upsert: true,
        contentType: "image/png",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error("Upload succeeded but no path returned");
    }

    console.log("Upload successful:", data);

    // Get public URL using the dream-images bucket
    const { data: publicUrlData } = supabase.storage
      .from("dream-images")
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData?.publicUrl;
    
    if (!publicUrl) {
      throw new Error("Failed to generate public URL");
    }
    
    console.log("Generated public URL:", publicUrl);
    
    return publicUrl;
  } catch (err) {
    console.error("uploadImageToSupabase error:", err);
    throw err; // Re-throw so calling code can handle it
  }
};

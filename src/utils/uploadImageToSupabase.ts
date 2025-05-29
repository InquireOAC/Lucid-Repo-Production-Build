
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
    console.log("uploadImageToSupabase called with:", { dataUrlOrUrl: dataUrlOrUrl.substring(0, 50) + "...", userId, dreamId });
    
    let pngBlob: Blob;

    if (dataUrlOrUrl.startsWith("data:image/")) {
      // Convert base64 DataURL to Blob
      const response = await fetch(dataUrlOrUrl);
      pngBlob = await response.blob();
    } else if (dataUrlOrUrl.startsWith("http")) {
      // Fetch remote image and convert to PNG
      console.log("Fetching remote image for PNG conversion");
      const response = await fetch(dataUrlOrUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Convert to PNG using canvas
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = dataUrlOrUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image for PNG conversion"));
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Convert to PNG blob
      pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to PNG blob"));
          }
        }, "image/png", 0.92);
      });
    } else {
      throw new Error("Unsupported image format for upload");
    }

    // Create storage path
    const timestamp = Date.now();
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;

    console.log("Uploading PNG to Supabase storage:", filePath);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("dream-images")
      .upload(filePath, pngBlob, {
        cacheControl: "public, max-age=31536000",
        upsert: true,
        contentType: "image/png",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    console.log("Upload successful:", data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("dream-images")
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData?.publicUrl;
    console.log("Generated public URL:", publicUrl);
    
    return publicUrl || null;
  } catch (err) {
    console.error("uploadImageToSupabase error:", err);
    throw err; // Re-throw so calling code can handle it
  }
};

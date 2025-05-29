
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
      // Fetch remote image and convert to PNG
      console.log("Fetching remote image for PNG conversion:", dataUrlOrUrl);
      
      const response = await fetch(dataUrlOrUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (compatible; Supabase-Function)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const originalBlob = await response.blob();
      console.log("Original image fetched:", originalBlob.size, "bytes, type:", originalBlob.type);
      
      // If it's already a PNG, use it directly
      if (originalBlob.type === "image/png") {
        pngBlob = originalBlob;
        console.log("Image is already PNG, using directly");
      } else {
        // Convert to PNG using canvas
        console.log("Converting image to PNG format");
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // Create object URL for the blob
        const imageUrl = URL.createObjectURL(originalBlob);
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log("Image loaded for conversion, dimensions:", img.width, "x", img.height);
            resolve(void 0);
          };
          img.onerror = (error) => {
            console.error("Failed to load image for conversion:", error);
            reject(new Error("Failed to load image for PNG conversion"));
          };
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
              console.log("Canvas converted to PNG blob:", blob.size, "bytes");
              resolve(blob);
            } else {
              reject(new Error("Failed to convert canvas to PNG blob"));
            }
          }, "image/png", 1.0); // Use maximum quality
        });
        
        // Clean up object URL
        URL.revokeObjectURL(imageUrl);
      }
    } else {
      throw new Error("Unsupported image format for upload");
    }

    if (!pngBlob || pngBlob.size === 0) {
      throw new Error("Generated PNG blob is empty");
    }

    // Create storage path
    const timestamp = Date.now();
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;

    console.log("Uploading PNG to Supabase storage:", filePath, "Size:", pngBlob.size, "bytes");
    
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
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error("Upload succeeded but no path returned");
    }

    console.log("Upload successful:", data);

    // Get public URL
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


import { supabase } from "@/integrations/supabase/client";

/**
 * Ultra-reliable image upload utility with URL expiration handling
 */
export const reliableImageUpload = async (
  imageUrl: string,
  userId: string,
  dreamId: string = "preview"
): Promise<string | null> => {
  console.log("=== STARTING RELIABLE IMAGE UPLOAD ===");
  console.log("Input params:", { imageUrl, userId, dreamId });

  try {
    // Step 1: Validate inputs
    if (!imageUrl || !userId) {
      console.error("Missing required parameters:", { imageUrl: !!imageUrl, userId: !!userId });
      throw new Error("Missing imageUrl or userId");
    }

    // Step 2: Fetch the image with aggressive timeout and retry logic
    console.log("Step 2: Fetching image from URL:", imageUrl);
    
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        response = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (compatible; DreamApp/1.0)',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          break; // Success, exit retry loop
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        retryCount++;
        console.warn(`Fetch attempt ${retryCount} failed:`, fetchError);
        
        if (retryCount >= maxRetries) {
          // If it's an OpenAI URL that expired, provide specific guidance
          if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
            throw new Error("OpenAI image URL has expired. The image was generated successfully but couldn't be saved to permanent storage. Please regenerate the image.");
          }
          throw new Error(`Failed to fetch image after ${maxRetries} attempts: ${fetchError.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    console.log("Fetch response status:", response.status, response.statusText);

    // Step 3: Convert to blob
    console.log("Step 3: Converting to blob...");
    const blob = await response.blob();
    console.log("Blob created:", {
      size: blob.size,
      type: blob.type
    });

    if (blob.size === 0) {
      throw new Error("Downloaded image is empty");
    }

    // Step 4: Create file path
    const timestamp = Date.now();
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.png`;
    console.log("Step 4: File path created:", filePath);

    // Step 5: Upload to Supabase
    console.log("Step 5: Uploading to Supabase storage...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("dreamimages")
      .upload(filePath, blob, {
        cacheControl: "public, max-age=31536000",
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log("Upload successful:", uploadData);

    // Step 6: Get public URL
    console.log("Step 6: Getting public URL...");
    const { data: publicUrlData } = supabase.storage
      .from("dreamimages")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    
    if (!publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    console.log("=== UPLOAD COMPLETE ===");
    console.log("Final public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("=== UPLOAD FAILED ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
    return null;
  }
};

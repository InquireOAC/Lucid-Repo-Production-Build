
import { supabase } from "@/integrations/supabase/client";

/**
 * Ultra-reliable image upload utility using dedicated edge function
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

    // Step 2: Call the dedicated upload edge function
    console.log("Calling upload-openai-image edge function...");
    
    const { data, error } = await supabase.functions.invoke('upload-openai-image', {
      body: {
        imageUrl,
        userId: `${userId}/dreams/${dreamId}`
      }
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Upload function failed: ${error.message}`);
    }

    if (!data?.success || !data?.publicUrl) {
      console.error("Upload function returned invalid response:", data);
      throw new Error("Upload function did not return a valid URL");
    }

    console.log("=== UPLOAD COMPLETE ===");
    console.log("Final public URL:", data.publicUrl);
    console.log("Upload details:", { path: data.path, size: data.size });
    
    return data.publicUrl;

  } catch (error) {
    console.error("=== UPLOAD FAILED ===");
    console.error("Error details:", error);
    
    // If it's an OpenAI URL that expired, provide specific guidance
    if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      console.warn("OpenAI URL may have expired - this is expected behavior");
      return null; // Return null to indicate upload failed but don't throw error
    }
    
    return null;
  }
};

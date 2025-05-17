
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Upload a base64 image data URL (e.g. from user-generated or selected image) to Supabase Storage
 * @param dataUrl - base64 image DataURL ("data:image/png;base64,...")
 * @param userId - user's unique ID (for storing files in a user-specific subfolder)
 * @param dreamId - dream ID (use for permanent storage, otherwise "preview")
 * @returns public URL to the uploaded file
 */
export const uploadImageToSupabase = async (
  dataUrl: string,
  userId: string,
  dreamId: string = "preview"
): Promise<string | null> => {
  try {
    if (!dataUrl.startsWith("data:image/")) {
      throw new Error("Only image DataURLs supported");
    }

    // Convert base64 DataURL to Blob
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString || "image/png" });

    // Make storage path unique and predictable
    const timestamp = Date.now();
    const ext = mimeString.split("/")[1] || "png";
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("dream-images")
      .upload(filePath, blob, {
        cacheControl: "public, max-age=31536000",
        upsert: true,
        contentType: mimeString,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("dream-images")
      .getPublicUrl(filePath);
    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error("uploadImageToSupabase error:", err);
    return null;
  }
};

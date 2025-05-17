import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Upload a base64 image data URL (e.g. from user-generated or selected image) to Supabase Storage
 * @param dataUrlOrUrl - base64 image DataURL ("data:image/png;base64,...") or remote image URL
 * @param userId - user's unique ID (for storing files in a user-specific subfolder)
 * @param dreamId - dream ID (use for permanent storage, otherwise "preview")
 * @returns public URL to the uploaded file
 */
export const uploadImageToSupabase = async (
  dataUrlOrUrl: string,
  userId: string,
  dreamId: string = "preview"
): Promise<string | null> => {
  try {
    let blob: Blob;
    let mimeString = "image/png";

    if (dataUrlOrUrl.startsWith("data:image/")) {
      // Convert base64 DataURL to Blob
      const byteString = atob(dataUrlOrUrl.split(",")[1]);
      mimeString = dataUrlOrUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: mimeString || "image/png" });
    } else if (dataUrlOrUrl.startsWith("http")) {
      // Fetch remote image (e.g., OpenAI)
      const response = await fetch(dataUrlOrUrl);
      mimeString = response.headers.get("content-type") || "image/png";
      blob = await response.blob();
    } else {
      throw new Error("Unsupported image format for upload");
    }

    // Make storage path unique and predictable
    const timestamp = Date.now();
    const ext = (mimeString.split("/")[1] || "png").split(";")[0];
    const filePath = `${userId}/dreams/${dreamId}-${timestamp}.${ext}`;

    // Upload!
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

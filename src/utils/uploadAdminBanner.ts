import { supabase } from "@/integrations/supabase/client";

export type AdminBannerKind = "announcement" | "event" | "challenge";

/**
 * Upload a banner image to the `admin-banners` storage bucket and return its public URL.
 * Path scheme: `{kind}/{timestamp}-{filename}`.
 */
export async function uploadAdminBanner(
  file: File,
  kind: AdminBannerKind,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase()
    .slice(0, 40) || "banner";
  const path = `${kind}/${Date.now()}-${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from("admin-banners")
    .upload(path, file, {
      cacheControl: "public, max-age=31536000",
      upsert: false,
      contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
    });

  if (error) throw new Error(`Banner upload failed: ${error.message}`);

  const { data } = supabase.storage.from("admin-banners").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Banner uploaded but no public URL returned");
  return data.publicUrl;
}

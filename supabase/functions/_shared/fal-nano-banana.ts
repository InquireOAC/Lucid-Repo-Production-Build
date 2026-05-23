// FAL nano-banana-2 adapter — generates / edits images in a single round-trip.
// Ported from Lucid Engine for use in Lucid Repo's cinematic dream feature.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FAL_BASE = "https://fal.run/fal-ai/nano-banana-2";

const ALLOWED_ASPECTS = new Set([
  "auto", "1:1", "16:9", "9:16", "3:4", "4:3", "21:9", "9:21", "4:1", "1:4", "8:1", "1:8",
]);

function normalizeAspect(aspect?: string | null): string {
  if (!aspect) return "9:16";
  return ALLOWED_ASPECTS.has(aspect) ? aspect : "9:16";
}

function normalizeResolution(quality?: string | null): "1K" | "2K" {
  if (quality === "2K" || quality === "4K") return "2K";
  return "1K";
}

function clampNumImages(n: unknown): number {
  const v = typeof n === "number" ? n : parseInt(String(n ?? 1), 10);
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(4, Math.floor(v)));
}

export interface FalNanoBananaOptions {
  prompt: string;
  numImages?: number;
  aspectRatio?: string | null;
  resolution?: string | null;
  imageUrls?: string[];
  outputFormat?: "png" | "jpeg";
}

export interface PersistOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  pathPrefix: string;
}

async function persistImages(hostedUrls: string[], opts: PersistOptions): Promise<string[]> {
  const supabase = createClient(opts.supabaseUrl, opts.serviceRoleKey);
  const out: string[] = [];
  for (let i = 0; i < hostedUrls.length; i += 1) {
    const url = hostedUrls[i];
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`download ${r.status}`);
      const contentType = (r.headers.get("content-type") || "image/png").split(";")[0].trim();
      const ext = contentType.split("/")[1] || "png";
      const bytes = new Uint8Array(await r.arrayBuffer());
      const path = `${opts.pathPrefix}-${Date.now()}-${i}-${crypto.randomUUID().slice(0, 6)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(opts.bucket)
        .upload(path, bytes, { contentType, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(opts.bucket).getPublicUrl(path);
      out.push(pub.publicUrl);
    } catch (err) {
      console.error("[fal-nano-banana] persist failed for", url, err);
    }
  }
  return out;
}

export async function falNanoBanana2(
  options: FalNanoBananaOptions,
  persist: PersistOptions,
): Promise<{ imageUrls: string[]; rawCount: number }> {
  const apiKey = Deno.env.get("FAL_API_KEY");
  if (!apiKey) throw new Error("FAL_API_KEY not configured");

  const numImages = clampNumImages(options.numImages ?? 1);
  const aspect_ratio = normalizeAspect(options.aspectRatio);
  const resolution = normalizeResolution(options.resolution);
  const refs = (options.imageUrls || []).filter((u) => typeof u === "string" && u.length > 0);

  const isEdit = refs.length > 0;
  const endpoint = isEdit ? `${FAL_BASE}/edit` : FAL_BASE;
  const payload: Record<string, unknown> = {
    prompt: options.prompt,
    num_images: numImages,
    aspect_ratio,
    resolution,
    output_format: options.outputFormat || "png",
  };
  if (isEdit) payload.image_urls = refs.slice(0, 14);

  console.log(`[fal-nano-banana] POST ${endpoint} num=${numImages} aspect=${aspect_ratio} res=${resolution} refs=${refs.length}`);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Key ${apiKey}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof body === "object" ? JSON.stringify(body).slice(0, 400) : String(body);
    console.error(`[fal-nano-banana] error ${res.status}: ${detail}`);
    throw new Error(`FAL nano-banana-2 failed (${res.status})`);
  }

  const images: any[] = Array.isArray(body?.images) ? body.images : [];
  const hostedUrls = images.map((img) => img?.url).filter((u: any): u is string => typeof u === "string");
  if (hostedUrls.length === 0) throw new Error("FAL nano-banana-2 returned no images");

  const persisted = await persistImages(hostedUrls, persist);
  if (persisted.length === 0) throw new Error("Failed to persist FAL images to storage");
  return { imageUrls: persisted, rawCount: hostedUrls.length };
}
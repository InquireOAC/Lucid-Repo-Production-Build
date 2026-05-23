// FAL Seedance image-to-video adapter.
//
// Submits to the FAL queue API, polls until complete, downloads the resulting
// MP4 and re-uploads to the dream-videos bucket.
//
// When `referenceImages` are supplied the call automatically routes to the
// omni-reference endpoint and passes them via `reference_images` so the model
// can lock identity (character / wardrobe / palette) across clips. Without
// references it stays on plain image-to-video.
//
// Endpoints are env-configurable so we can move between i2v and omni without
// redeploying:
//   FAL_SEEDANCE_MODEL       -> default fal-ai/seedance-2/image-to-video
//   FAL_SEEDANCE_OMNI_MODEL  -> default fal-ai/seedance-2/omni-reference
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const DEFAULT_SEEDANCE_I2V_MODEL = "fal-ai/seedance-2/image-to-video";
const DEFAULT_SEEDANCE_OMNI_MODEL = "fal-ai/seedance-2/reference-to-video";
const QUEUE_BASE = "https://queue.fal.run";
const MAX_REFERENCES = 4; // omni-reference cap; extras get dropped

export type SeedanceDuration = 5 | 10 | 15;

export interface SeedanceOptions {
  prompt: string;
  imageUrl: string; // start frame
  endImageUrl?: string;
  aspectRatio?: string; // default "9:16"
  duration?: SeedanceDuration; // default 5
  resolution?: "480p" | "720p" | "1080p"; // default "720p"
  /** Explicit model override (e.g. to force a different FAL slug for one call). */
  model?: string;
  /** Identity anchors for omni-reference mode. Non-empty array routes the
   *  call to the omni endpoint and injects `reference_images`. */
  referenceImages?: string[];
}

export interface SeedancePersistOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  path: string; // full object path including filename
}

function resolveI2VModel(override?: string): string {
  return override || Deno.env.get("FAL_SEEDANCE_MODEL") || DEFAULT_SEEDANCE_I2V_MODEL;
}

function resolveOmniModel(override?: string): string {
  return override || Deno.env.get("FAL_SEEDANCE_OMNI_MODEL") || DEFAULT_SEEDANCE_OMNI_MODEL;
}

async function falFetch(url: string, init: RequestInit, apiKey: string) {
  const headers = {
    ...(init.headers || {}),
    Authorization: `Key ${apiKey}`,
    "Content-Type": "application/json",
  } as Record<string, string>;
  return fetch(url, { ...init, headers });
}

export async function falSeedanceImageToVideo(
  options: SeedanceOptions,
  persist: SeedancePersistOptions,
): Promise<{ videoUrl: string }> {
  const apiKey = Deno.env.get("FAL_API_KEY");
  if (!apiKey) throw new Error("FAL_API_KEY not configured");

  const refs = (options.referenceImages || []).filter((u) => typeof u === "string" && u.length > 0);
  const useOmni = refs.length > 0;
  const model = options.model
    ? options.model
    : useOmni
      ? resolveOmniModel()
      : resolveI2VModel();

  const duration: SeedanceDuration = (options.duration ?? 5) as SeedanceDuration;

  const payload: Record<string, unknown> = {
    prompt: options.prompt,
    image_url: options.imageUrl,
    aspect_ratio: options.aspectRatio || "9:16",
    duration,
    resolution: options.resolution || "720p",
  };
  if (options.endImageUrl) payload.end_image_url = options.endImageUrl;
  if (useOmni) {
    payload.reference_images = refs.slice(0, MAX_REFERENCES);
  }

  console.log(
    `[fal-seedance] submit model=${model} aspect=${payload.aspect_ratio} duration=${payload.duration}s refs=${useOmni ? (payload.reference_images as string[]).length : 0}`,
  );

  const submit = await falFetch(`${QUEUE_BASE}/${model}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, apiKey);
  const submitBody = await submit.json().catch(() => ({}));
  if (!submit.ok) {
    console.error(`[fal-seedance] submit error ${submit.status}:`, JSON.stringify(submitBody).slice(0, 500));
    throw new Error(`Seedance submit failed (${submit.status})`);
  }
  const requestId = submitBody?.request_id;
  if (!requestId) throw new Error("Seedance returned no request_id");

  // Poll for completion. 15s clips take ~90–180s.
  const statusUrl = `${QUEUE_BASE}/${model}/requests/${requestId}/status`;
  const resultUrl = `${QUEUE_BASE}/${model}/requests/${requestId}`;
  const maxAttempts = 90; // ~7.5 min at 5s
  let videoHostedUrl: string | null = null;
  for (let i = 0; i < maxAttempts; i += 1) {
    await new Promise((r) => setTimeout(r, 5000));
    const sRes = await falFetch(statusUrl, { method: "GET" }, apiKey);
    const sBody = await sRes.json().catch(() => ({}));
    const status = sBody?.status;
    if (status === "COMPLETED") {
      const rRes = await falFetch(resultUrl, { method: "GET" }, apiKey);
      const rBody = await rRes.json().catch(() => ({}));
      videoHostedUrl = rBody?.video?.url || rBody?.output?.video?.url || null;
      break;
    }
    if (status === "FAILED" || status === "ERROR") {
      throw new Error(`Seedance failed: ${JSON.stringify(sBody).slice(0, 300)}`);
    }
    console.log(`[fal-seedance] status=${status} attempt=${i + 1}`);
  }

  if (!videoHostedUrl) throw new Error("Seedance timed out waiting for video");

  // Download + persist
  const dl = await fetch(videoHostedUrl);
  if (!dl.ok) throw new Error(`Failed to download Seedance video (${dl.status})`);
  const bytes = new Uint8Array(await dl.arrayBuffer());
  const supabase = createClient(persist.supabaseUrl, persist.serviceRoleKey);
  const { error: upErr } = await supabase.storage
    .from(persist.bucket)
    .upload(persist.path, bytes, { contentType: "video/mp4", upsert: true });
  if (upErr) throw new Error(`Failed to persist Seedance video: ${upErr.message}`);
  const { data: pub } = supabase.storage.from(persist.bucket).getPublicUrl(persist.path);
  return { videoUrl: pub.publicUrl };
}

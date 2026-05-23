// ElevenLabs TTS adapter — synthesizes MP3 narration and persists to dream-audio bucket.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah

export interface TTSOptions {
  text: string;
  voiceId?: string;
  previousText?: string;
  nextText?: string;
}

export interface TTSPersistOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  path: string;
}

export async function elevenLabsTTS(
  options: TTSOptions,
  persist: TTSPersistOptions,
): Promise<{ audioUrl: string; base64: string }> {
  const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

  const voiceId = options.voiceId || DEFAULT_VOICE_ID;

  const body: Record<string, unknown> = {
    text: options.text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.35,
      use_speaker_boost: true,
      speed: 1.0,
    },
  };
  if (options.previousText) body.previous_text = options.previousText;
  if (options.nextText) body.next_text = options.nextText;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const supabase = createClient(persist.supabaseUrl, persist.serviceRoleKey);
  const { error: upErr } = await supabase.storage
    .from(persist.bucket)
    .upload(persist.path, bytes, { contentType: "audio/mpeg", upsert: true });
  if (upErr) throw new Error(`Failed to persist narration: ${upErr.message}`);
  const { data: pub } = supabase.storage.from(persist.bucket).getPublicUrl(persist.path);

  return { audioUrl: pub.publicUrl, base64: base64Encode(buffer) };
}
// ============================================================
// Lucid Engine shared image assembly request builder
// Mirrors src/lib/image-request-builder.ts in Lucid Engine.
// All image generation calls should be assembled via this
// module so the request shape stays consistent across both apps.
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export type JobType =
  | 'dream-cover'       // Single hero image for the dream
  | 'section-beat'      // Per-section/beat image in a cinematic sequence
  | 'character-sheet'   // Character reference image
  | 'world-establishing'; // World/environment anchor image

export type FrameTarget = 'start' | 'end' | 'detached';

export interface CharacterBinding {
  characterId: string;
  role: 'primary' | 'secondary' | 'background';
  photoUrl: string;
  /** Encoded face data for FAL reference consistency */
  visualFingerprint?: string;
  /** Lucid Engine LoRA fine-tune ID for stronger visual consistency */
  loraId?: string;
}

export interface StructuredReference {
  type: 'character' | 'environment' | 'style' | 'element';
  url: string;
  /** e.g. 'character:Hero', 'environment:forest-path' */
  label: string;
}

export interface ImageAssemblyRequest {
  /** Supabase dream_entries.id */
  dreamId: string;
  jobType: JobType;
  /** Section index (0-based) for beat images; omit for cover */
  frameTarget?: number;
  prompt: string;
  /** Image style hint passed to the cinematic prompt compiler */
  style?: string;
  characterBindings?: CharacterBinding[];
  references?: StructuredReference[];
  /** global_environments.id to anchor location visuals */
  environmentId?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  qualityMode?: 'preview' | 'final';
  /** Number of image variations to generate (1–4) */
  numImages?: number;
  /** If true, automatically save result to dream_entries after generation */
  applyToDream?: boolean;
  /** Input image URL for edit/inpaint jobs */
  inputImage?: string | null;
}

export interface ImageAssemblyResult {
  imageUrl: string;
  prompt?: string;
  jobId?: string;
}

/**
 * Build a standard ImageAssemblyRequest from common dream generation params.
 * The caller should fill in `prompt` from the cinematic prompt compiler output.
 */
export function buildImageRequest(params: {
  dreamId: string;
  jobType?: JobType;
  frameTarget?: number;
  style?: string;
  environmentId?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  qualityMode?: 'preview' | 'final';
  characterBindings?: CharacterBinding[];
  environmentImageUrl?: string;
  environmentName?: string;
  inputImage?: string | null;
}): Omit<ImageAssemblyRequest, 'prompt'> {
  const references: StructuredReference[] = [];

  if (params.environmentImageUrl && params.environmentName) {
    references.push({
      type: 'environment',
      url: params.environmentImageUrl,
      label: `environment:${params.environmentName}`,
    });
  }

  return {
    dreamId: params.dreamId,
    jobType: params.jobType ?? 'dream-cover',
    frameTarget: params.frameTarget,
    style: params.style ?? 'surreal-cinematic',
    aspectRatio: params.aspectRatio ?? '16:9',
    qualityMode: params.qualityMode ?? 'preview',
    characterBindings: params.characterBindings ?? [],
    references,
    environmentId: params.environmentId,
    inputImage: params.inputImage ?? null,
  };
}

/**
 * Invoke the assemble-image-generation edge function.
 * This is the single entry point for all dream image generation.
 */
export async function invokeImageAssembly(
  request: ImageAssemblyRequest
): Promise<ImageAssemblyResult> {
  const { data, error } = await supabase.functions.invoke('generate-dream-image', {
    body: {
      dreamId:           request.dreamId,
      jobType:           request.jobType,
      frameTarget:       request.frameTarget,
      prompt:            request.prompt,
      style:             request.style,
      characterBindings: request.characterBindings ?? [],
      references:        request.references ?? [],
      environmentId:     request.environmentId,
      aspectRatio:       request.aspectRatio ?? '16:9',
      qualityMode:       request.qualityMode ?? 'preview',
      numImages:         request.numImages ?? 1,
      applyToDream:      request.applyToDream ?? false,
      inputImage:        request.inputImage ?? null,
    },
  });

  if (error) throw new Error(error.message);

  return {
    imageUrl: data?.imageUrl ?? data?.image_url ?? '',
    prompt:   data?.prompt,
    jobId:    data?.jobId,
  };
}

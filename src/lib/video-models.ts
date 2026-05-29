// ============================================================
// Lucid Engine shared video model registry
// Mirrors src/lib/video-models.ts in Lucid Engine.
// The `model` field in generate-shot-video / generate-dream-video
// edge function calls must be a VideoModelId from this registry.
// ============================================================

export const VIDEO_MODEL_IDS = [
  'veo-2',
  'veo-3.1',
  'veo-3.1-fast',
  'kling-v2-6',
  'kling-v3-standard',
  'seedance-2.0',
  'seedance-2.0-fast',
  'wan-2.1',
  'hailuo-02',
] as const;

export type VideoModelId = typeof VIDEO_MODEL_IDS[number];

export type VideoProvider =
  | 'google'
  | 'kling'
  | 'bytedance'
  | 'wan'
  | 'hailuo';

export type LucidTierRequired = 'free' | 'spark' | 'dreamer' | 'studio';

export interface VideoModelMeta {
  id: VideoModelId;
  label: string;
  provider: VideoProvider;
  minDurationSeconds: number;
  maxDurationSeconds: number;
  qualities: ('720p' | '1080p' | '4k')[];
  supportsNativeAudio: boolean;
  supportsStartFrame: boolean;
  supportsEndFrame: boolean;
  /** Minimum subscription tier to use this model */
  requiredTier: LucidTierRequired;
  /** Credits per second of generated video */
  creditsPerSecond: number;
}

export const VIDEO_MODEL_REGISTRY: Record<VideoModelId, VideoModelMeta> = {
  'veo-2': {
    id: 'veo-2',
    label: 'Veo 2',
    provider: 'google',
    minDurationSeconds: 5,
    maxDurationSeconds: 8,
    qualities: ['720p'],
    supportsNativeAudio: false,
    supportsStartFrame: true,
    supportsEndFrame: false,
    requiredTier: 'dreamer',
    creditsPerSecond: 2,
  },
  'veo-3.1': {
    id: 'veo-3.1',
    label: 'Veo 3.1',
    provider: 'google',
    minDurationSeconds: 5,
    maxDurationSeconds: 8,
    qualities: ['720p', '1080p'],
    supportsNativeAudio: true,
    supportsStartFrame: true,
    supportsEndFrame: false,
    requiredTier: 'studio',
    creditsPerSecond: 5,
  },
  'veo-3.1-fast': {
    id: 'veo-3.1-fast',
    label: 'Veo 3.1 Fast',
    provider: 'google',
    minDurationSeconds: 5,
    maxDurationSeconds: 8,
    qualities: ['720p'],
    supportsNativeAudio: false,
    supportsStartFrame: true,
    supportsEndFrame: false,
    requiredTier: 'spark',
    creditsPerSecond: 2,
  },
  'kling-v2-6': {
    id: 'kling-v2-6',
    label: 'Kling v2.6',
    provider: 'kling',
    minDurationSeconds: 5,
    maxDurationSeconds: 10,
    qualities: ['720p', '1080p'],
    supportsNativeAudio: false,
    supportsStartFrame: true,
    supportsEndFrame: true,
    requiredTier: 'dreamer',
    creditsPerSecond: 5,
  },
  'kling-v3-standard': {
    id: 'kling-v3-standard',
    label: 'Kling v3',
    provider: 'kling',
    minDurationSeconds: 4,
    maxDurationSeconds: 12,
    qualities: ['720p', '1080p'],
    supportsNativeAudio: false,
    supportsStartFrame: true,
    supportsEndFrame: true,
    requiredTier: 'studio',
    creditsPerSecond: 6,
  },
  'seedance-2.0': {
    id: 'seedance-2.0',
    label: 'Seedance 2.0',
    provider: 'bytedance',
    minDurationSeconds: 4,
    maxDurationSeconds: 15,
    qualities: ['720p', '1080p'],
    supportsNativeAudio: true,
    supportsStartFrame: true,
    supportsEndFrame: true,
    requiredTier: 'spark',
    creditsPerSecond: 5,
  },
  'seedance-2.0-fast': {
    id: 'seedance-2.0-fast',
    label: 'Seedance 2.0 Fast',
    provider: 'bytedance',
    minDurationSeconds: 4,
    maxDurationSeconds: 12,
    qualities: ['720p'],
    supportsNativeAudio: true,
    supportsStartFrame: true,
    supportsEndFrame: false,
    requiredTier: 'free',
    creditsPerSecond: 3,
  },
  'wan-2.1': {
    id: 'wan-2.1',
    label: 'Wan 2.1',
    provider: 'wan',
    minDurationSeconds: 3,
    maxDurationSeconds: 6,
    qualities: ['720p'],
    supportsNativeAudio: false,
    supportsStartFrame: true,
    supportsEndFrame: false,
    requiredTier: 'spark',
    creditsPerSecond: 3,
  },
  'hailuo-02': {
    id: 'hailuo-02',
    label: 'Hailuo 02',
    provider: 'hailuo',
    minDurationSeconds: 3,
    maxDurationSeconds: 6,
    qualities: ['720p', '1080p'],
    supportsNativeAudio: false,
    supportsStartFrame: true,
    supportsEndFrame: false,
    requiredTier: 'dreamer',
    creditsPerSecond: 4,
  },
};

/** Default model for new users / free tier */
export const DEFAULT_VIDEO_MODEL: VideoModelId = 'seedance-2.0-fast';

/** Get all models available to a given tier */
export function getModelsForTier(tierId: LucidTierRequired): VideoModelMeta[] {
  const tierOrder: LucidTierRequired[] = ['free', 'spark', 'dreamer', 'studio'];
  const tierIndex = tierOrder.indexOf(tierId);
  return Object.values(VIDEO_MODEL_REGISTRY).filter(
    m => tierOrder.indexOf(m.requiredTier) <= tierIndex
  );
}

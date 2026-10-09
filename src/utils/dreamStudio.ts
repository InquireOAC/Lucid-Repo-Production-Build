import { splitStoryAroundScenes } from "./illustratedStory.ts";

export interface StudioClipVersion {
  url: string;
  source_image_url: string;
  created_at: string;
}

export interface StudioScene {
  section: number;
  text: string;
  brief?: string;
  image_url?: string;
  prompt?: string;
  video_url?: string;
  motion_prompt?: string;
  image_variants?: string[];
  clip_variants?: StudioClipVersion[];
  clip_source_image_url?: string;
  image_error?: string;
  clip_error?: string;
  studio_style?: string;
  studio_use_avatar?: boolean;
  story_text_exact?: boolean;
  film_versions?: string[];
  film_order?: number[];
  include_voice?: boolean;
  clip_duration_seconds?: number;
}

export const STUDIO_STEPS = ["Story", "Scenes", "Images", "Motion", "Film", "Share"] as const;
export type StudioStep = typeof STUDIO_STEPS[number];

export const STYLE_OPTIONS = [
  { id: "surreal", label: "Surreal", color: "from-fuchsia-500/70 via-sky-500/50 to-indigo-900" },
  { id: "realistic", label: "Cinematic", color: "from-amber-300/60 via-slate-500/50 to-slate-950" },
  { id: "fantasy", label: "Fantasy", color: "from-emerald-400/70 via-teal-600/50 to-indigo-950" },
  { id: "cyberpunk", label: "Neon", color: "from-pink-500/80 via-violet-600/50 to-blue-950" },
];

/** Keep generated scene summaries separate from the user's exact story prose. */
export function makeScenePlan(content: string, suggestions: Array<{ text: string }>): StudioScene[] {
  const briefs = suggestions.length ? suggestions.slice(0, 4) : [{ text: content }];
  const passages = splitStoryAroundScenes(content, briefs);
  return briefs.map((suggestion, index) => ({
    section: index + 1,
    text: passages[index] || "",
    brief: suggestion.text?.trim() || passages[index] || "",
    story_text_exact: true,
  }));
}

export function normalizeScenes(raw: unknown, content = ""): StudioScene[] {
  if (!Array.isArray(raw)) return [];
  const scenes = raw.filter((scene) => scene && typeof scene === "object")
    .map((scene, index) => {
      const normalized = { ...scene, section: index + 1 } as StudioScene;
      if (normalized.image_url && !normalized.image_variants?.length) normalized.image_variants = [normalized.image_url];
      if (normalized.video_url && !normalized.clip_variants?.length) {
        normalized.clip_source_image_url = normalized.clip_source_image_url || normalized.image_url;
        normalized.clip_variants = [{ url: normalized.video_url, source_image_url: normalized.clip_source_image_url || "", created_at: "" }];
      }
      return normalized;
    });
  const sameStory = scenes.map((scene) => scene.text.trim()).join(" ").replace(/\s+/g, " ") === content.trim().replace(/\s+/g, " ");
  if (!content || (scenes.every((scene) => scene.story_text_exact) && sameStory)) return scenes;
  const passages = splitStoryAroundScenes(content, scenes);
  return scenes.map((scene, index) => ({ ...scene, brief: scene.brief || scene.text, text: passages[index] || "", story_text_exact: true }));
}

export function selectImage(scene: StudioScene, url: string): StudioScene {
  const variants = [...new Set([...(scene.image_variants || []), scene.image_url, url].filter(Boolean) as string[])];
  return { ...scene, image_url: url, image_variants: variants, image_error: undefined };
}

export function selectClip(scene: StudioScene, url: string, sourceImageUrl: string): StudioScene {
  const versions = [...(scene.clip_variants || []).filter((clip) => clip.url !== url), {
    url, source_image_url: sourceImageUrl, created_at: new Date().toISOString(),
  }];
  return { ...scene, video_url: url, clip_source_image_url: sourceImageUrl, clip_variants: versions, clip_error: undefined };
}

export function isCurrentClip(scene: StudioScene): boolean {
  return !!scene.video_url && !!scene.image_url && (!scene.clip_source_image_url || scene.clip_source_image_url === scene.image_url);
}

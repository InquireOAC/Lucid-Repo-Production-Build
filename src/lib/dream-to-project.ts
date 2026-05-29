// ============================================================
// dream-to-project
// Transforms a Lucid Repo DreamEntry into a Lucid Engine
// project schema so dreams can be opened directly in the
// full studio for advanced editing.
//
// Because both apps share the same Supabase project and user_id,
// the export writes directly to the `projects` table — no file
// transfer or API key required. Characters, environments, and
// all generated assets are already accessible from either app.
// ============================================================

import type { DreamEntry, DreamCharacterReference } from '@/types/dream';
import { supabase } from '@/integrations/supabase/client';

// ---------- Lucid Engine project schema (mirror) ----------

export interface LucidEngineScene {
  index: number;
  sceneNumber: number;
  title: string;
  scriptText: string;
  description: string;
  storyboardImageUrl?: string;
  videoUrl?: string;
  prompt?: string;
}

export interface LucidEngineCharacterRef {
  /** Same id as dream_characters.id — shared user_id means same Supabase row */
  id: string;
  name: string;
  photoUrl?: string;
  loraId?: string;
}

export interface LucidEngineProject {
  id: string;
  userId?: string;
  title: string;
  description: string;
  /** Signals to Lucid Engine that this project originated in Lucid Repo */
  sourceApp: 'lucid-repo';
  sourceDreamId: string;
  filmStyle?: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  status: 'draft';
  thumbnailUrl?: string;
  scenes: LucidEngineScene[];
  characters: LucidEngineCharacterRef[];
  createdAt: string;
}

// ----------------------------------------------------------

/**
 * Build a LucidEngineProject from a DreamEntry + character list.
 * This is a pure function — it makes no network calls.
 */
export function dreamToProject(
  dream: DreamEntry,
  characters: DreamCharacterReference[] = []
): LucidEngineProject {
  const scenes: LucidEngineScene[] = (dream.section_images ?? []).map((s, i) => ({
    index: i,
    sceneNumber: i + 1,
    title: `Scene ${i + 1}`,
    scriptText: s.text ?? '',
    description: s.text ?? '',
    storyboardImageUrl: s.image_url ?? undefined,
    videoUrl: s.video_url ?? undefined,
    prompt: s.prompt ?? undefined,
  }));

  // If no sections, treat the full dream content as a single scene
  if (scenes.length === 0) {
    scenes.push({
      index: 0,
      sceneNumber: 1,
      title: 'Scene 1',
      scriptText: dream.content ?? '',
      description: dream.content ?? '',
      storyboardImageUrl: dream.image_url ?? dream.generatedImage ?? undefined,
      videoUrl: dream.video_url ?? undefined,
    });
  }

  const engineCharacters: LucidEngineCharacterRef[] = characters.map(c => ({
    id: c.id,
    name: c.name,
    photoUrl: c.photoUrl,
    loraId: c.loraId,
  }));

  return {
    id: dream.id,
    userId: dream.user_id ?? dream.userId,
    title: dream.title,
    description: dream.content ?? '',
    sourceApp: 'lucid-repo',
    sourceDreamId: dream.id,
    filmStyle: 'lucid-realism',
    aspectRatio: '16:9',
    status: 'draft',
    thumbnailUrl: dream.image_url ?? dream.generatedImage ?? undefined,
    scenes,
    characters: engineCharacters,
    createdAt: dream.created_at ?? new Date().toISOString(),
  };
}

/**
 * Write the project directly to Lucid Engine's `projects` table.
 * Works because both apps share the same Supabase project.
 * Returns the project ID on success.
 */
export async function exportDreamToSharedDb(
  project: LucidEngineProject,
  userId: string
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  const { data, error } = await supabase
    .from('projects')
    .upsert(
      {
        id:               project.id,
        user_id:          userId,
        title:            project.title,
        dream_text:       project.description,
        film_style:       project.filmStyle ?? 'lucid-realism',
        aspect_ratio:     project.aspectRatio,
        status:           project.status,
        thumbnail_url:    project.thumbnailUrl ?? null,
        // Lucid Engine may not have all these columns yet — use a metadata jsonb if needed
        source_app:       project.sourceApp,
        source_dream_id:  project.sourceDreamId,
        created_at:       project.createdAt,
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select('id')
    .single();

  if (error) {
    // Fallback: log the error but don't crash — the deep-link approach still works
    console.error('[dream-to-project] export failed:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, projectId: data?.id ?? project.id };
}

/**
 * Build a deep-link URL that opens a dream as a project in Lucid Engine.
 * Used when direct DB write is not available (cross-instance deployments).
 */
export function buildLucidEngineDeepLink(
  project: LucidEngineProject,
  engineBaseUrl: string
): string {
  const params = new URLSearchParams({
    source: 'lucid-repo',
    dreamId: project.sourceDreamId,
  });
  return `${engineBaseUrl}/studio/${project.id}?${params.toString()}`;
}

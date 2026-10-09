// ============================================================
// useDreamVersions
// Non-destructive versioning for generated dream frames.
// Mirrors Lucid Engine's useShotVersions pattern — every
// generated image is stored as a row, allowing the user to
// browse history and re-activate any previous generation.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { DreamFrameVersion } from '@/types/dream';

interface UseDreamVersionsOptions {
  dreamId: string;
  /** Section index (0-based); use -1 for the cover image */
  frameTarget: number;
}

interface UseDreamVersionsReturn {
  versions: DreamFrameVersion[];
  activeVersion: DreamFrameVersion | null;
  loading: boolean;
  /** Insert a new version and mark it active (clears previous active) */
  addVersion: (imageUrl: string, prompt?: string, modelUsed?: string) => Promise<DreamFrameVersion | null>;
  /** Make a specific historical version the active one */
  activateVersion: (versionId: string) => Promise<void>;
  reload: () => void;
}

export function useDreamVersions({
  dreamId,
  frameTarget,
}: UseDreamVersionsOptions): UseDreamVersionsReturn {
  const { user } = useAuth();
  const [versions, setVersions] = useState<DreamFrameVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    if (!dreamId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('dream_frame_versions')
      .select('*')
      .eq('dream_id', dreamId)
      .eq('frame_target', frameTarget)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVersions(data.map(row => ({
        id:          row.id,
        dreamId:     row.dream_id,
        frameTarget: row.frame_target,
        imageUrl:    row.image_url,
        prompt:      row.prompt ?? undefined,
        modelUsed:   row.model_used ?? undefined,
        createdAt:   row.created_at,
        isActive:    row.is_active,
      })));
    }
    setLoading(false);
  }, [dreamId, frameTarget]);

  useEffect(() => {
    fetchVersions();

    // Realtime: reflect new rows as they land
    const channel = supabase
      .channel(`dream-versions-${dreamId}-${frameTarget}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dream_frame_versions',
          filter: `dream_id=eq.${dreamId}`,
        },
        () => fetchVersions()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dreamId, frameTarget, fetchVersions]);

  const addVersion = useCallback(async (
    imageUrl: string,
    prompt?: string,
    modelUsed?: string,
  ): Promise<DreamFrameVersion | null> => {
    if (!user?.id || !dreamId) return null;

    // Deactivate all previous versions for this (dream, frameTarget)
    await supabase
      .from('dream_frame_versions')
      .update({ is_active: false })
      .eq('dream_id', dreamId)
      .eq('frame_target', frameTarget);

    const { data, error } = await supabase
      .from('dream_frame_versions')
      .insert({
        dream_id:     dreamId,
        frame_target: frameTarget,
        image_url:    imageUrl,
        prompt:       prompt ?? null,
        model_used:   modelUsed ?? null,
        is_active:    true,
        user_id:      user.id,
      })
      .select()
      .single();

    if (error || !data) return null;

    const newVersion: DreamFrameVersion = {
      id:          data.id,
      dreamId:     data.dream_id,
      frameTarget: data.frame_target,
      imageUrl:    data.image_url,
      prompt:      data.prompt ?? undefined,
      modelUsed:   data.model_used ?? undefined,
      createdAt:   data.created_at,
      isActive:    true,
    };

    setVersions(prev => [newVersion, ...prev.map(v => ({ ...v, isActive: false }))]);
    return newVersion;
  }, [user?.id, dreamId, frameTarget]);

  const activateVersion = useCallback(async (versionId: string) => {
    // Deactivate all, then set chosen one active
    await supabase
      .from('dream_frame_versions')
      .update({ is_active: false })
      .eq('dream_id', dreamId)
      .eq('frame_target', frameTarget);

    await supabase
      .from('dream_frame_versions')
      .update({ is_active: true })
      .eq('id', versionId);

    setVersions(prev =>
      prev.map(v => ({ ...v, isActive: v.id === versionId }))
    );
  }, [dreamId, frameTarget]);

  const activeVersion = versions.find(v => v.isActive) ?? versions[0] ?? null;

  return {
    versions,
    activeVersion,
    loading,
    addVersion,
    activateVersion,
    reload: fetchVersions,
  };
}

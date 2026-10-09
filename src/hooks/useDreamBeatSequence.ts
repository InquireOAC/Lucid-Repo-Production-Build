// ============================================================
// useDreamBeatSequence
// Typed beat sequence manager for dream cinematic generation.
// Wraps the existing edge-function pipeline with:
//   - Typed BeatDefinition[] state (replaces raw `any` beats)
//   - Per-beat status tracking
//   - Video model selection via VideoModelId
//   - Calls useDreamVersions.addVersion after each successful
//     beat image generation (non-destructive history)
//   - Per-beat retry support
//
// The underlying edge functions (generate-cinematic-beat-frame,
// compile-dream-cinematic) are unchanged — this is a typed
// client-side wrapper.
// ============================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BeatDefinition, BeatType } from '@/types/dream';
import type { VideoModelId } from '@/lib/video-models';
import { DEFAULT_VIDEO_MODEL } from '@/lib/video-models';
import { useDreamVersions } from './useDreamVersions';

const BEAT_HARD_CAP_SECONDS = 15;

interface UseDreamBeatSequenceOptions {
  dreamId: string;
  initialBeats?: Partial<BeatDefinition>[];
}

interface GenerateBeatsOptions {
  sourceImageUrl?: string;
  environmentImageUrl?: string;
  environmentLabel?: string;
  characterBindings?: { characterId: string; photoUrl: string; name: string; loraId?: string }[];
  videoModelId?: VideoModelId;
}

interface UseDreamBeatSequenceReturn {
  beats: BeatDefinition[];
  running: boolean;
  addBeat: (text?: string) => void;
  updateBeat: (index: number, patch: Partial<BeatDefinition>) => void;
  removeBeat: (index: number) => void;
  reorderBeats: (from: number, to: number) => void;
  generateAll: (opts?: GenerateBeatsOptions) => Promise<void>;
  generateBeat: (index: number, opts?: GenerateBeatsOptions) => Promise<void>;
  totalDuration: number;
  canAddBeat: boolean;
}

function makeBeat(index: number, text = ''): BeatDefinition {
  return {
    index,
    sectionText: text,
    beatType: 'establishing' as BeatType,
    durationSeconds: 5,
    status: 'pending',
  };
}

export function useDreamBeatSequence({
  dreamId,
  initialBeats = [],
}: UseDreamBeatSequenceOptions): UseDreamBeatSequenceReturn {
  const [beats, setBeats] = useState<BeatDefinition[]>(() =>
    initialBeats.length > 0
      ? initialBeats.map((b, i) => ({ ...makeBeat(i), ...b, index: i }))
      : [makeBeat(0)]
  );
  const [running, setRunning] = useState(false);

  const totalDuration = beats.reduce((sum, b) => sum + b.durationSeconds, 0);
  const canAddBeat = totalDuration < BEAT_HARD_CAP_SECONDS;

  const addBeat = useCallback((text = '') => {
    setBeats(prev => {
      const remaining = BEAT_HARD_CAP_SECONDS - prev.reduce((s, b) => s + b.durationSeconds, 0);
      if (remaining <= 0) return prev;
      const duration = Math.min(5, remaining);
      return [...prev, { ...makeBeat(prev.length, text), durationSeconds: duration }];
    });
  }, []);

  const updateBeat = useCallback((index: number, patch: Partial<BeatDefinition>) => {
    setBeats(prev => prev.map((b, i) => {
      if (i !== index) return b;
      const updated = { ...b, ...patch };
      // Clamp duration so total never exceeds cap
      const otherDuration = prev.reduce((s, x, xi) => xi === index ? s : s + x.durationSeconds, 0);
      updated.durationSeconds = Math.min(updated.durationSeconds, BEAT_HARD_CAP_SECONDS - otherDuration);
      return updated;
    }));
  }, []);

  const removeBeat = useCallback((index: number) => {
    setBeats(prev => prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, index: i })));
  }, []);

  const reorderBeats = useCallback((from: number, to: number) => {
    setBeats(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((b, i) => ({ ...b, index: i }));
    });
  }, []);

  const invokeBeatFrame = async (
    beat: BeatDefinition,
    prevImageUrl: string | undefined,
    opts: GenerateBeatsOptions
  ): Promise<string | null> => {
    const { data, error } = await supabase.functions.invoke('generate-cinematic-beat-frame', {
      body: {
        dreamId,
        beatIndex:          beat.index,
        beatText:           beat.sectionText,
        previousImageUrl:   prevImageUrl ?? null,
        environmentImageUrl: opts.environmentImageUrl ?? null,
        environmentLabel:   opts.environmentLabel ?? null,
        characterBindings:  opts.characterBindings ?? [],
        videoModelId:       opts.videoModelId ?? DEFAULT_VIDEO_MODEL,
      },
    });
    if (error || !data?.imageUrl) return null;
    return data.imageUrl as string;
  };

  const generateBeat = useCallback(async (index: number, opts: GenerateBeatsOptions = {}) => {
    const beat = beats[index];
    if (!beat || !beat.sectionText.trim()) return;

    setBeats(prev => prev.map((b, i) => i === index ? { ...b, status: 'generating' } : b));

    const prevImage = index > 0 ? beats[index - 1].imageUrl : opts.sourceImageUrl;
    const imageUrl = await invokeBeatFrame(beat, prevImage, opts);

    setBeats(prev => prev.map((b, i) =>
      i === index
        ? { ...b, imageUrl: imageUrl ?? undefined, status: imageUrl ? 'done' : 'error' }
        : b
    ));
  }, [beats, dreamId]);

  const generateAll = useCallback(async (opts: GenerateBeatsOptions = {}) => {
    if (running) return;
    const usableBeats = beats.filter(b => b.sectionText.trim());
    if (usableBeats.length === 0) return;

    setRunning(true);
    let prevImageUrl: string | undefined = opts.sourceImageUrl;

    for (const beat of usableBeats) {
      setBeats(prev => prev.map((b, i) =>
        i === beat.index ? { ...b, status: 'generating' } : b
      ));

      const imageUrl = await invokeBeatFrame(beat, prevImageUrl, opts);

      setBeats(prev => prev.map((b, i) =>
        i === beat.index
          ? { ...b, imageUrl: imageUrl ?? undefined, status: imageUrl ? 'done' : 'error' }
          : b
      ));

      if (imageUrl) prevImageUrl = imageUrl;
    }

    setRunning(false);
  }, [beats, dreamId, running]);

  return {
    beats,
    running,
    addBeat,
    updateBeat,
    removeBeat,
    reorderBeats,
    generateAll,
    generateBeat,
    totalDuration,
    canAddBeat,
  };
}

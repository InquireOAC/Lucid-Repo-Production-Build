import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCinematicVideo, type AssembleBeat } from "@/utils/cinematicAssembler";
import { toast } from "sonner";

export type CinematicStage = "idle" | "compiling" | "generating" | "assembling" | "uploading" | "done" | "error";

export function useDreamCinematic(dreamId: string) {
  const [stage, setStage] = useState<CinematicStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // True when generation produced beats but the client-side stitch/upload
  // failed — the (paid) clips are still on the server, so the user can retry
  // just the assembly without regenerating.
  const [canRetryStitch, setCanRetryStitch] = useState(false);

  // Stitch the rendered beats into the final clip and persist it. Separated
  // from generation so it can be retried independently (the canvas/MediaRecorder
  // pipeline is the most failure-prone step on mobile WebViews).
  const stitchAndUpload = useCallback(async (beats: AssembleBeat[]) => {
    if (!beats.length) throw new Error("No rendered segments to assemble");

    setStage("assembling");
    const blob = await assembleCinematicVideo(beats, (pct) => setProgress(50 + pct * 0.4));

    setStage("uploading");
    setProgress(95);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const path = `${user.id}/cinematic/${dreamId}-final-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("dream-videos")
      .upload(path, blob, { contentType: blob.type, upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from("dream-videos").getPublicUrl(path);

    await supabase.from("dream_cinematic_specs")
      .update({ final_video_url: pub.publicUrl })
      .eq("dream_id", dreamId);
    await supabase.from("dream_entries")
      .update({ video_url: pub.publicUrl })
      .eq("id", dreamId);

    setVideoUrl(pub.publicUrl);
    setProgress(100);
    setStage("done");
    setCanRetryStitch(false);
    toast.success("Cinematic dream ready");
    return pub.publicUrl;
  }, [dreamId]);

  // Read the already-generated beats for this dream (used by the resume/retry
  // path so a failed stitch doesn't force a full, paid regeneration).
  const fetchRenderedBeats = useCallback(async (): Promise<AssembleBeat[]> => {
    const { data } = await supabase
      .from("dream_cinematic_beats")
      .select("video_url, narration_url, start_time, end_time")
      .eq("dream_id", dreamId)
      .order("beat_index");
    return (data || []).filter((b: any) => b.video_url) as AssembleBeat[];
  }, [dreamId]);

  const run = useCallback(async (voiceId?: string) => {
    setError(null);
    setVideoUrl(null);
    setCanRetryStitch(false);
    try {
      setStage("compiling");
      setProgress(5);
      const compile = await supabase.functions.invoke("compile-dream-cinematic", {
        body: { dreamId, totalDuration: 30 },
      });
      if (compile.error) throw new Error(compile.error.message);
      if (compile.data?.error) throw new Error(compile.data.error);

      setStage("generating");
      setProgress(15);
      const assemble = await supabase.functions.invoke("assemble-cinematic-dream", {
        body: { dreamId, voiceId },
      });
      if (assemble.error) throw new Error(assemble.error.message);
      if (assemble.data?.error) throw new Error(assemble.data.error);

      const beats: AssembleBeat[] = (assemble.data?.beats || []).filter((b: any) => b.video_url);
      if (!beats.length) throw new Error("No beats completed");

      // From here on the (paid) clips exist server-side; if the stitch fails the
      // user can retry it without paying to regenerate.
      setCanRetryStitch(true);
      return await stitchAndUpload(beats);
    } catch (e: any) {
      console.error("[useDreamCinematic] failed", e);
      setError(e?.message || "Generation failed");
      setStage("error");
      toast.error(e?.message || "Cinematic generation failed");
      return null;
    }
  }, [dreamId, stitchAndUpload]);

  // Retry only the client-side assembly using the beats already rendered on the
  // server — no recompile, no regeneration, no extra generation cost.
  const retryStitch = useCallback(async () => {
    setError(null);
    try {
      setStage("generating");
      setProgress(50);
      const beats = await fetchRenderedBeats();
      if (!beats.length) throw new Error("No rendered segments found to assemble");
      return await stitchAndUpload(beats);
    } catch (e: any) {
      console.error("[useDreamCinematic] retryStitch failed", e);
      setError(e?.message || "Assembly failed");
      setStage("error");
      toast.error(e?.message || "Assembly failed");
      return null;
    }
  }, [fetchRenderedBeats, stitchAndUpload]);

  return { stage, progress, error, videoUrl, run, retryStitch, canRetryStitch };
}

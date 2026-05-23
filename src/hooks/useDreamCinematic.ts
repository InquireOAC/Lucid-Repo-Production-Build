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

  const run = useCallback(async (voiceId?: string) => {
    setError(null);
    setVideoUrl(null);
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
      toast.success("Cinematic dream ready");
      return pub.publicUrl;
    } catch (e: any) {
      console.error("[useDreamCinematic] failed", e);
      setError(e?.message || "Generation failed");
      setStage("error");
      toast.error(e?.message || "Cinematic generation failed");
      return null;
    }
  }, [dreamId]);

  return { stage, progress, error, videoUrl, run };
}
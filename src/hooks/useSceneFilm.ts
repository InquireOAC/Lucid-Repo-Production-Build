import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCinematicVideo, type AssembleBeat } from "@/utils/cinematicAssembler";
import { toast } from "sonner";

export type FilmStage = "idle" | "preparing" | "assembling" | "uploading" | "done" | "error";

interface Scene {
  image_url?: string;
  video_url?: string;
  narration_url?: string | null;
}

// Read a clip's real duration so each scene plays in full when stitched.
function getVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    const done = (d: number) => resolve(Number.isFinite(d) && d > 0 ? d : 6);
    v.onloadedmetadata = () => done(v.duration);
    v.onerror = () => done(6);
  });
}

/**
 * Scene-based "Export Film": stitches the per-scene clips the user has already
 * generated (scene.video_url) into one cinematic and saves it to the dream.
 * This is the images-first path — the cinematic is built FROM the scene images'
 * videos, not from freshly generated key frames. Reuses the client assembler.
 */
export function useSceneFilm(dreamId: string, onDone?: (url: string) => void) {
  const [stage, setStage] = useState<FilmStage>("idle");
  const [progress, setProgress] = useState(0);

  const exportFilm = useCallback(
    async (scenes: Scene[]) => {
      const clips = scenes.filter((s) => !!s.video_url);
      if (clips.length < 1) {
        toast.error("Generate a video for at least one scene first.");
        return null;
      }
      try {
        setStage("preparing");
        setProgress(5);

        let t = 0;
        const beats: AssembleBeat[] = [];
        for (const c of clips) {
          const d = await getVideoDuration(c.video_url as string);
          beats.push({
            video_url: c.video_url as string,
            narration_url: c.narration_url ?? null,
            start_time: t,
            end_time: t + d,
          });
          t += d;
        }

        setStage("assembling");
        const blob = await assembleCinematicVideo(beats, (pct) => setProgress(10 + pct * 0.8));

        setStage("uploading");
        setProgress(95);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in");
        const ext = blob.type.includes("mp4") ? "mp4" : "webm";
        const path = `${user.id}/cinematic/${dreamId}-film-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("dream-videos")
          .upload(path, blob, { contentType: blob.type, upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("dream-videos").getPublicUrl(path);

        await supabase.from("dream_entries").update({ video_url: pub.publicUrl }).eq("id", dreamId);

        setProgress(100);
        setStage("done");
        toast.success("Your film is ready");
        onDone?.(pub.publicUrl);
        return pub.publicUrl;
      } catch (e: any) {
        console.error("[useSceneFilm] export failed", e);
        setStage("error");
        toast.error(e?.message || "Film export failed");
        return null;
      }
    },
    [dreamId, onDone],
  );

  return { stage, progress, exportFilm };
}

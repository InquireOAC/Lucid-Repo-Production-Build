// Client-side assembler for cinematic dream videos.
// Plays each beat's MP4 in a hidden <video>, draws frames to a <canvas>, captures
// canvas.captureStream() with MediaRecorder, and mixes per-beat narration audio
// via Web Audio API so the final blob includes both visuals and voiceover.

export interface AssembleBeat {
  video_url: string;
  narration_url?: string | null;
  end_time: number;
  start_time: number;
}

const TARGET_W = 720;
const TARGET_H = 1280;

async function loadVideo(url: string): Promise<HTMLVideoElement> {
  const v = document.createElement("video");
  v.crossOrigin = "anonymous";
  v.src = url;
  v.muted = true;
  v.playsInline = true;
  await new Promise<void>((resolve, reject) => {
    v.onloadeddata = () => resolve();
    v.onerror = () => reject(new Error(`Failed to load ${url}`));
  });
  return v;
}

async function loadAudio(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return ctx.decodeAudioData(buf);
}

export async function assembleCinematicVideo(
  beats: AssembleBeat[],
  onProgress?: (pct: number) => void,
): Promise<Blob> {
  if (!beats.length) throw new Error("No beats to assemble");

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;
  const ctx2d = canvas.getContext("2d")!;

  // Audio mixing
  const audioCtx = new AudioContext();
  const dest = audioCtx.createMediaStreamDestination();

  // Preload all videos + narration buffers
  const videos = await Promise.all(beats.map((b) => loadVideo(b.video_url)));
  const narrations = await Promise.all(
    beats.map((b) => b.narration_url ? loadAudio(b.narration_url, audioCtx) : Promise.resolve(null)),
  );

  const videoStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const chunks: BlobPart[] = [];
  const mimeCandidates = [
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";
  const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 4_000_000 });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });

  recorder.start();

  let elapsed = 0;
  const totalDuration = beats.reduce((acc, b) => acc + Math.max(0.5, b.end_time - b.start_time), 0);

  for (let i = 0; i < beats.length; i += 1) {
    const beat = beats[i];
    const video = videos[i];
    const narr = narrations[i];
    const clipDuration = Math.max(0.5, beat.end_time - beat.start_time);

    // Schedule narration to play now
    if (narr) {
      const src = audioCtx.createBufferSource();
      src.buffer = narr;
      src.connect(dest);
      src.start();
    }

    video.currentTime = 0;
    await video.play().catch(() => {});

    const startMs = performance.now();
    while ((performance.now() - startMs) / 1000 < clipDuration) {
      // contain into 9:16 canvas
      const vw = video.videoWidth || TARGET_W;
      const vh = video.videoHeight || TARGET_H;
      const scale = Math.max(TARGET_W / vw, TARGET_H / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (TARGET_W - dw) / 2;
      const dy = (TARGET_H - dh) / 2;
      ctx2d.fillStyle = "#000";
      ctx2d.fillRect(0, 0, TARGET_W, TARGET_H);
      try { ctx2d.drawImage(video, dx, dy, dw, dh); } catch (_) {}
      await new Promise((r) => setTimeout(r, 33));
      if (onProgress) {
        const localPct = ((performance.now() - startMs) / 1000) / clipDuration;
        onProgress(Math.min(100, ((elapsed + localPct * clipDuration) / totalDuration) * 100));
      }
    }
    video.pause();
    elapsed += clipDuration;
  }

  recorder.stop();
  await stopped;
  try { audioCtx.close(); } catch (_) {}

  return new Blob(chunks, { type: mimeType.startsWith("video/mp4") ? "video/mp4" : "video/webm" });
}
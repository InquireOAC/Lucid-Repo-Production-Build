/**
 * Renders a share video from multiple dream media items using Canvas + MediaRecorder.
 * Produces a webm video with crossfade transitions and text overlay.
 */

export interface ShareMediaItem {
  type: 'image' | 'video';
  url: string;
}

interface SourceCropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const IMAGE_DURATION = 3000; // ms per image
const VIDEO_MAX_DURATION = 5000; // ms per video clip
const CROSSFADE_DURATION = 1000; // ms for crossfade
const FPS = 30;
const FRAME_MS = 1000 / FPS;

const loadImageAsync = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });

const loadVideoAsync = (src: string): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
    video.src = src;
  });

function detectVideoLetterboxRatios(video: HTMLVideoElement): { top: number; bottom: number } | null {
  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  if (!srcW || !srcH) return null;

  const sampleW = Math.max(120, Math.min(240, srcW));
  const sampleH = Math.max(120, Math.round((srcH / srcW) * sampleW));
  const canvas = document.createElement('canvas');
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(video, 0, 0, sampleW, sampleH);
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
    const maxScanRows = Math.floor(sampleH * 0.4);
    const sampleStep = Math.max(1, Math.floor(sampleW / 80));

    const isBlackBarRow = (row: number): boolean => {
      let sum = 0;
      let sumSq = 0;
      let count = 0;

      for (let x = 0; x < sampleW; x += sampleStep) {
        const i = (row * sampleW + x) * 4;
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        sum += lum;
        sumSq += lum * lum;
        count++;
      }

      if (!count) return false;
      const mean = sum / count;
      const variance = Math.max(sumSq / count - mean * mean, 0);
      const stdDev = Math.sqrt(variance);

      return mean < 18 && stdDev < 10;
    };

    let topRows = 0;
    while (topRows < maxScanRows && isBlackBarRow(topRows)) topRows++;

    let bottomRows = 0;
    while (bottomRows < maxScanRows && isBlackBarRow(sampleH - 1 - bottomRows)) bottomRows++;

    const combinedRatio = (topRows + bottomRows) / sampleH;
    if (combinedRatio < 0.06) return null;

    return {
      top: topRows / sampleH,
      bottom: bottomRows / sampleH,
    };
  } catch {
    return null;
  }
}

function getVideoCropRect(video: HTMLVideoElement): SourceCropRect | null {
  const letterbox = detectVideoLetterboxRatios(video);
  if (!letterbox) return null;

  const sy = Math.max(0, Math.floor(video.videoHeight * letterbox.top));
  const sh = Math.max(1, Math.floor(video.videoHeight * (1 - letterbox.top - letterbox.bottom)));

  if (sh < video.videoHeight * 0.55) return null;

  return {
    sx: 0,
    sy,
    sw: video.videoWidth,
    sh,
  };
}

export function estimateVideoLetterboxScale(video: HTMLVideoElement): number {
  const crop = getVideoCropRect(video);
  if (!crop) return 1;
  return Math.min(1.8, Math.max(1, video.videoHeight / crop.sh));
}

/** Draw an image/video cover-fitted onto the canvas */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLVideoElement,
  w: number,
  h: number,
  cropRect?: SourceCropRect | null
) {
  const naturalW = img instanceof HTMLImageElement ? img.naturalWidth : img.videoWidth;
  const naturalH = img instanceof HTMLImageElement ? img.naturalHeight : img.videoHeight;
  const srcW = cropRect?.sw ?? naturalW;
  const srcH = cropRect?.sh ?? naturalH;
  if (!srcW || !srcH) return;

  const imgRatio = srcW / srcH;
  const canvasRatio = w / h;
  let drawW: number, drawH: number, drawX: number, drawY: number;
  if (imgRatio > canvasRatio) {
    drawH = h; drawW = h * imgRatio;
    drawX = (w - drawW) / 2; drawY = 0;
  } else {
    drawW = w; drawH = w / imgRatio;
    drawX = 0; drawY = (h - drawH) / 2;
  }
  const sx = cropRect?.sx ?? 0;
  const sy = cropRect?.sy ?? 0;
  ctx.drawImage(img, sx, sy, srcW, srcH, drawX, drawY, drawW, drawH);
}

/** Wrap text into lines for canvas rendering */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines) { lines[lines.length - 1] += "..."; return lines; }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    if (lines.length >= maxLines) lines[lines.length - 1] += "...";
    else lines.push(currentLine);
  }
  return lines;
}

/** Draw the text overlay on the canvas (bottom panel) */
function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  title: string,
  dateStr: string,
  excerpt: string,
  logoImg: HTMLImageElement | null
) {
  const W = CANVAS_W, H = CANVAS_H, padX = 72;

  // Bottom gradient
  const bottomGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
  bottomGrad.addColorStop(0, "transparent");
  bottomGrad.addColorStop(0.3, "rgba(0,0,0,0.3)");
  bottomGrad.addColorStop(0.6, "rgba(0,0,0,0.7)");
  bottomGrad.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H * 0.35, W, H * 0.65);

  let y = H;

  // Logo
  if (logoImg) {
    const logoW = 700;
    const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
    const logoX = (W - logoW) / 2;
    const logoY = H - 80 - logoH;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    y = logoY - 48;
  } else {
    y = H - 180;
  }

  // Excerpt
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(226,232,240,0.8)";
  ctx.textBaseline = "bottom";
  const excerptLines = wrapText(ctx, excerpt, W - padX * 2, 4);
  for (let i = excerptLines.length - 1; i >= 0; i--) {
    ctx.fillText(excerptLines[i], padX, y);
    y -= 51;
  }
  y -= 12;

  // Divider
  const divGrad = ctx.createLinearGradient(padX, 0, W - padX, 0);
  divGrad.addColorStop(0, "rgba(96,165,250,0.5)");
  divGrad.addColorStop(0.5, "rgba(139,92,246,0.3)");
  divGrad.addColorStop(1, "transparent");
  ctx.fillStyle = divGrad;
  ctx.fillRect(padX, y - 1, W - padX * 2, 1);
  y -= 33;

  // Date
  ctx.font = "24px monospace";
  ctx.fillStyle = "rgba(226,232,240,0.5)";
  ctx.fillText(dateStr, padX, y);
  y -= 52;

  // Title
  ctx.font = "bold 64px sans-serif";
  ctx.fillStyle = "#ffffff";
  const titleLines = wrapText(ctx, title, W - padX * 2, 3);
  for (let i = titleLines.length - 1; i >= 0; i--) {
    ctx.fillText(titleLines[i], padX, y);
    y -= 70;
  }
  y -= 10;

  // Label
  ctx.font = "20px monospace";
  ctx.fillStyle = "rgba(96,165,250,0.7)";
  ctx.fillText("✦ DREAM JOURNAL ✦", padX, y);
}

/**
 * Collects all shareable media items from a dream entry.
 */
export function collectDreamMedia(dream: {
  image_url?: string;
  generatedImage?: string;
  video_url?: string;
  section_images?: Array<{ image_url?: string; video_url?: string }>;
}): ShareMediaItem[] {
  const items: ShareMediaItem[] = [];
  
  // Hero: prefer video over image
  if (dream.video_url) {
    items.push({ type: 'video', url: dream.video_url });
  } else {
    const heroImage = dream.image_url || dream.generatedImage;
    if (heroImage) items.push({ type: 'image', url: heroImage });
  }
  
  // Sections: prefer video over image per section
  if (dream.section_images) {
    for (const section of dream.section_images) {
      if (section.video_url) {
        items.push({ type: 'video', url: section.video_url });
      } else if (section.image_url) {
        items.push({ type: 'image', url: section.image_url });
      }
    }
  }
  
  return items;
}

/**
 * Check if the browser supports MediaRecorder with webm.
 */
export function supportsVideoRecording(): boolean {
  if (typeof MediaRecorder === 'undefined') return false;
  try {
    return MediaRecorder.isTypeSupported('video/mp4; codecs=avc1') ||
           MediaRecorder.isTypeSupported('video/mp4') ||
           MediaRecorder.isTypeSupported('video/webm; codecs=vp9') ||
           MediaRecorder.isTypeSupported('video/webm');
  } catch {
    return false;
  }
}

function getRecorderMimeType(): string {
  if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) return 'video/webm; codecs=vp9';
  if (MediaRecorder.isTypeSupported('video/webm')) return 'video/webm';
  if (MediaRecorder.isTypeSupported('video/mp4')) return 'video/mp4';
  return 'video/webm';
}

/**
 * Renders a share video from dream media items.
 * Returns a Blob of the video file.
 */
export async function renderShareVideo(
  mediaItems: ShareMediaItem[],
  title: string,
  dateStr: string,
  excerpt: string,
  logoUrl: string,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // Preload logo
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImageAsync(`${window.location.origin}${logoUrl}`);
  } catch { /* no logo */ }

  // Preload all media
  const loadedMedia: Array<{
    type: 'image' | 'video';
    element: HTMLImageElement | HTMLVideoElement;
    cropRect?: SourceCropRect | null;
  }> = [];
  for (const item of mediaItems) {
    try {
      if (item.type === 'image') {
        const img = await loadImageAsync(item.url);
        loadedMedia.push({ type: 'image', element: img });
      } else {
        const vid = await loadVideoAsync(item.url);
        loadedMedia.push({ type: 'video', element: vid, cropRect: getVideoCropRect(vid) });
      }
    } catch (e) {
      console.warn('Failed to load media item:', item.url, e);
    }
  }

  if (loadedMedia.length === 0) {
    throw new Error('No media items could be loaded');
  }

  // Calculate total duration
  const segments: Array<{ startMs: number; durationMs: number; index: number }> = [];
  let totalMs = 0;
  for (let i = 0; i < loadedMedia.length; i++) {
    const dur = loadedMedia[i].type === 'video' 
      ? Math.min((loadedMedia[i].element as HTMLVideoElement).duration * 1000 || VIDEO_MAX_DURATION, VIDEO_MAX_DURATION)
      : IMAGE_DURATION;
    segments.push({ startMs: totalMs, durationMs: dur, index: i });
    totalMs += dur;
    if (i < loadedMedia.length - 1) totalMs += CROSSFADE_DURATION;
  }

  // Cap at 30 seconds
  totalMs = Math.min(totalMs, 30000);

  const mimeType = getRecorderMimeType();
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const ext = mimeType.includes('mp4') ? 'video/mp4' : 'video/webm';
      resolve(new Blob(chunks, { type: ext }));
    };
    recorder.onerror = (e) => reject(e);
  });

  recorder.start();

  // Start any videos that need to play
  for (const m of loadedMedia) {
    if (m.type === 'video') {
      (m.element as HTMLVideoElement).currentTime = 0;
    }
  }

  // Animation loop
  const startTime = performance.now();
  let activeVideoPlaying: HTMLVideoElement | null = null;

  const renderFrame = async (): Promise<void> => {
    const elapsed = performance.now() - startTime;
    if (elapsed >= totalMs) {
      recorder.stop();
      return;
    }

    onProgress?.(Math.min(elapsed / totalMs, 1));

    // Clear
    ctx.fillStyle = "#060B18";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Find which segments are active (potentially two during crossfade)
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segEnd = seg.startMs + seg.durationMs;
      const nextStart = i < segments.length - 1 ? segments[i + 1].startMs : Infinity;
      
      // Crossfade zone: between segEnd and nextStart + CROSSFADE_DURATION
      // Current segment is visible from seg.startMs to segEnd + CROSSFADE_DURATION (fading out)
      const visibleStart = seg.startMs;
      const visibleEnd = segEnd + (i < segments.length - 1 ? CROSSFADE_DURATION : 0);

      if (elapsed >= visibleStart && elapsed < visibleEnd) {
        // Calculate alpha
        let alpha = 1;
        
        // Fade in (only for non-first segments, during crossfade overlap)
        if (i > 0) {
          const prevSegEnd = segments[i - 1].startMs + segments[i - 1].durationMs;
          if (elapsed < prevSegEnd + CROSSFADE_DURATION) {
            alpha = (elapsed - seg.startMs) / CROSSFADE_DURATION;
          }
        }
        
        // Fade out
        if (elapsed > segEnd && i < segments.length - 1) {
          alpha = 1 - (elapsed - segEnd) / CROSSFADE_DURATION;
        }

        alpha = Math.max(0, Math.min(1, alpha));
        ctx.globalAlpha = alpha;

        const media = loadedMedia[seg.index];
        if (media.type === 'image') {
          drawCoverImage(ctx, media.element as HTMLImageElement, CANVAS_W, CANVAS_H);
        } else {
          const vid = media.element as HTMLVideoElement;
          // Start playing if we're in this segment's active zone
          if (elapsed >= seg.startMs && elapsed < segEnd && vid !== activeVideoPlaying) {
            if (activeVideoPlaying && activeVideoPlaying !== vid) {
              activeVideoPlaying.pause();
            }
            vid.currentTime = 0;
            vid.play().catch(() => {});
            activeVideoPlaying = vid;
          }
          if (vid.readyState >= 2) {
            drawCoverImage(ctx, vid, CANVAS_W, CANVAS_H, media.cropRect);
          }
        }
      }
    }

    ctx.globalAlpha = 1;
    drawTextOverlay(ctx, title, dateStr, excerpt, logoImg);

    // Wait for next frame
    await new Promise(r => setTimeout(r, FRAME_MS));
    return renderFrame();
  };

  await renderFrame();

  // Cleanup videos
  for (const m of loadedMedia) {
    if (m.type === 'video') {
      (m.element as HTMLVideoElement).pause();
      (m.element as HTMLVideoElement).src = '';
    }
  }

  return done;
}

import React, { useState, useRef, useEffect, useCallback } from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard, { DreamShareCardRef } from "./DreamShareCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share as CapacitorShare } from "@capacitor/share";
import { collectDreamMedia, supportsVideoRecording, renderShareVideo, ShareMediaItem, estimateVideoLetterboxScale } from "@/utils/shareVideoRenderer";

const LOGO_PATH = "/lovable-uploads/e94fd126-8216-43a0-a62d-cf081a8c036f.png";

interface ShareButtonProps {
  dream: DreamEntry;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
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
};

const renderShareCardToCanvas = async (
  dreamImageUrl: string,
  title: string,
  dateStr: string,
  excerpt: string,
  logoUrl: string
): Promise<string> => {
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#060B18";
  ctx.fillRect(0, 0, W, H);

  const dreamImg = dreamImageUrl ? await loadImage(dreamImageUrl) : null;
  if (dreamImg) {
    const imgRatio = dreamImg.naturalWidth / dreamImg.naturalHeight;
    const canvasRatio = W / H;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (imgRatio > canvasRatio) {
      drawH = H; drawW = H * imgRatio; drawX = (W - drawW) / 2; drawY = 0;
    } else {
      drawW = W; drawH = W / imgRatio; drawX = 0; drawY = (H - drawH) / 2;
    }
    ctx.drawImage(dreamImg, drawX, drawY, drawW, drawH);
  } else {
    const bg = ctx.createLinearGradient(0, 0, W * 0.3, H);
    bg.addColorStop(0, "#060B18"); bg.addColorStop(0.4, "#0C1629"); bg.addColorStop(1, "#111B33");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 300);
    glow.addColorStop(0, "rgba(56,130,246,0.15)"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  }

  const bottomGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
  bottomGrad.addColorStop(0, "transparent"); bottomGrad.addColorStop(0.3, "rgba(0,0,0,0.3)");
  bottomGrad.addColorStop(0.6, "rgba(0,0,0,0.7)"); bottomGrad.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = bottomGrad; ctx.fillRect(0, H * 0.35, W, H * 0.65);

  const panelGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
  panelGrad.addColorStop(0, "transparent"); panelGrad.addColorStop(0.2, "rgba(6,11,24,0.5)");
  panelGrad.addColorStop(1, "rgba(6,11,24,0.8)");
  ctx.fillStyle = panelGrad; ctx.fillRect(0, H * 0.55, W, H * 0.45);

  const padX = 72;
  let y = H;

  const logoImg = await loadImage(`${window.location.origin}${logoUrl}`);
  if (logoImg) {
    const logoW = 700;
    const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
    ctx.drawImage(logoImg, (W - logoW) / 2, H - 80 - logoH, logoW, logoH);
    y = H - 80 - logoH - 48;
  } else {
    y = H - 180;
  }

  ctx.font = "32px sans-serif"; ctx.fillStyle = "rgba(226,232,240,0.8)"; ctx.textBaseline = "bottom";
  const excerptLines = wrapText(ctx, excerpt, W - padX * 2, 4);
  for (let i = excerptLines.length - 1; i >= 0; i--) { ctx.fillText(excerptLines[i], padX, y); y -= 51; }
  y -= 12;

  const divGrad = ctx.createLinearGradient(padX, 0, W - padX, 0);
  divGrad.addColorStop(0, "rgba(96,165,250,0.5)"); divGrad.addColorStop(0.5, "rgba(139,92,246,0.3)"); divGrad.addColorStop(1, "transparent");
  ctx.fillStyle = divGrad; ctx.fillRect(padX, y - 1, W - padX * 2, 1); y -= 33;

  ctx.font = "24px monospace"; ctx.fillStyle = "rgba(226,232,240,0.5)";
  ctx.fillText(dateStr, padX, y); y -= 52;

  ctx.font = "bold 64px sans-serif"; ctx.fillStyle = "#ffffff";
  const titleLines = wrapText(ctx, title, W - padX * 2, 3);
  for (let i = titleLines.length - 1; i >= 0; i--) { ctx.fillText(titleLines[i], padX, y); y -= 70; }
  y -= 10;

  ctx.font = "20px monospace"; ctx.fillStyle = "rgba(96,165,250,0.7)";
  ctx.fillText("✦ DREAM JOURNAL ✦", padX, y);

  return canvas.toDataURL("image/png");
};

// ─── Animated Preview ─────────────────────────────────────────────
const AnimatedPreview: React.FC<{
  mediaItems: ShareMediaItem[];
  title: string;
  dateStr: string;
  excerpt: string;
}> = ({ mediaItems, title, dateStr, excerpt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [videoScaleByUrl, setVideoScaleByUrl] = useState<Record<string, number>>({});

  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % mediaItems.length);
        setFade(true);
      }, 800);
    }, 3500);
    return () => clearInterval(interval);
  }, [mediaItems.length]);

  const current = mediaItems[currentIndex];
  const currentVideoScale = current?.type === 'video' ? (videoScaleByUrl[current.url] ?? 1) : 1;

  return (
    <div
      className="w-full mx-auto overflow-hidden relative"
      style={{ aspectRatio: '9/16', borderRadius: '12px', background: '#060B18' }}
    >
      {/* Media layer */}
      <div
        style={{
          position: 'absolute', inset: 0,
          transition: 'opacity 0.8s ease-in-out',
          opacity: fade ? 1 : 0,
        }}
      >
        {current?.type === 'video' ? (
          <video
            key={current.url}
            src={current.url}
            autoPlay
            muted
            playsInline
            loop
            onLoadedData={(e) => {
              const scale = estimateVideoLetterboxScale(e.currentTarget);
              setVideoScaleByUrl((prev) => (prev[current.url] === scale ? prev : { ...prev, [current.url]: scale }));
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
              transform: currentVideoScale > 1 ? `scale(${currentVideoScale})` : undefined,
              transformOrigin: 'center center',
            }}
          />
        ) : current?.url ? (
          <img
            key={current.url}
            src={current.url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(165deg, #060B18 0%, #0C1629 40%, #111B33 100%)',
          }}>
            <div style={{
              position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
              width: '60%', height: '40%',
              background: 'radial-gradient(ellipse at center, rgba(56,130,246,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }} />
          </div>
        )}
      </div>

      {/* Media counter dots */}
      {mediaItems.length > 1 && (
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '6px', zIndex: 10,
        }}>
          {mediaItems.map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.92) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Text panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 24px 20px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{
          fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase' as const,
          color: 'rgba(96,165,250,0.7)', fontFamily: 'monospace', marginBottom: '10px',
        }}>
          ✦ DREAM JOURNAL ✦
        </div>
        <h2 style={{
          fontSize: '20px', fontWeight: 700, lineHeight: 1.15,
          color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '10px', color: 'rgba(226,232,240,0.5)',
          marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '0.5px',
        }}>
          {dateStr}
        </p>
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, rgba(96,165,250,0.5), rgba(139,92,246,0.3), transparent)',
          marginBottom: '12px',
        }} />
        <p style={{
          fontSize: '12px', lineHeight: 1.55,
          color: 'rgba(226,232,240,0.8)', marginBottom: '18px',
        }}>
          {excerpt}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={LOGO_PATH} alt="Lucid Repo" style={{ width: '65%', height: 'auto', objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const ShareButton: React.FC<ShareButtonProps> = ({
  dream,
  variant = "outline",
  size = "default",
  className = ""
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const shareCardRef = useRef<DreamShareCardRef>(null);

  const normalizedDream = {
    ...dream,
    id: dream.id || `dream-${Date.now()}`,
    title: dream.title || "Untitled Dream",
    generatedImage: dream.generatedImage || dream.image_url || null,
    imagePrompt: dream.imagePrompt || dream.image_prompt || "",
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };

  const dreamImageUrl = normalizedDream.generatedImage || "";
  const excerpt = normalizedDream.content.length > 150
    ? normalizedDream.content.substring(0, 150) + "..."
    : normalizedDream.content;
  const formattedDate = normalizedDream.date
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(normalizedDream.date))
    : "";

  const mediaItems = collectDreamMedia(dream);
  const hasMultipleMedia = mediaItems.length > 1;
  const canRecordVideo = hasMultipleMedia && supportsVideoRecording();

  const handleShareClick = () => {
    if (isSharing) return;
    setShowShareDialog(true);
  };

  const handleSaveStatic = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const dataUrl = await renderShareCardToCanvas(dreamImageUrl, normalizedDream.title, formattedDate, excerpt, LOGO_PATH);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const filename = `${normalizedDream.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`;

      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({ path: filename, data: base64Data, directory: Directory.Cache });
        await CapacitorShare.share({
          title: normalizedDream.title,
          text: `Check out my dream from Lucid Repo: ${normalizedDream.title}`,
          url: savedFile.uri, dialogTitle: 'Share Your Dream Card'
        });
        toast.success("Share card ready!");
      } else {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'image/png' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = filename;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Share card downloaded!");
      }
      setTimeout(() => setShowShareDialog(false), 500);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save share card");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVideo = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setProgress(0);
    try {
      toast.info("Rendering share video...");
      const blob = await renderShareVideo(mediaItems, normalizedDream.title, formattedDate, excerpt, LOGO_PATH, setProgress);
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const filename = `${normalizedDream.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.${ext}`;

      if (Capacitor.isNativePlatform()) {
        // Convert blob to base64 for filesystem write
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const savedFile = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
        await CapacitorShare.share({
          title: normalizedDream.title,
          text: `Check out my dream from Lucid Repo: ${normalizedDream.title}`,
          url: savedFile.uri, dialogTitle: 'Share Your Dream Video'
        });
        toast.success("Share video ready!");
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = filename;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Share video downloaded!");
      }
      setTimeout(() => setShowShareDialog(false), 500);
    } catch (error) {
      console.error("Video render error:", error);
      toast.error("Failed to render share video. Saving as image instead.");
      await handleSaveStatic();
    } finally {
      setIsSaving(false);
      setProgress(0);
    }
  };

  if (!normalizedDream.title || !normalizedDream.content) return null;

  return (
    <>
      <Button
        onClick={handleShareClick}
        variant={variant}
        size={size}
        disabled={isSharing}
        className={`flex items-center justify-center gap-2 ${className}`}
      >
        <Share size={18} />
        <span>Share</span>
      </Button>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm max-h-[95vh] overflow-y-auto p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center">
              {canRecordVideo ? "Share Dream Video" : "Share Your Dream"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {hasMultipleMedia ? (
              <AnimatedPreview
                mediaItems={mediaItems}
                title={normalizedDream.title}
                dateStr={formattedDate}
                excerpt={excerpt}
              />
            ) : (
              /* Static single-image preview */
              <div
                className="w-full mx-auto overflow-hidden relative"
                style={{ aspectRatio: '9/16', borderRadius: '12px', background: '#060B18' }}
              >
                {dreamImageUrl ? (
                  <img
                    src={dreamImageUrl} alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(165deg, #060B18 0%, #0C1629 40%, #111B33 100%)',
                  }}>
                    <div style={{
                      position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
                      width: '60%', height: '40%',
                      background: 'radial-gradient(ellipse at center, rgba(56,130,246,0.15) 0%, transparent 70%)',
                      filter: 'blur(40px)',
                    }} />
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.92) 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '16px 20px 24px 20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  <div style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase' as const, color: 'rgba(96,165,250,0.7)', fontFamily: 'monospace', marginBottom: '10px' }}>
                    ✦ DREAM JOURNAL ✦
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.15, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                    {normalizedDream.title}
                  </h2>
                  <p style={{ fontSize: '10px', color: 'rgba(226,232,240,0.5)', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {formattedDate}
                  </p>
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(96,165,250,0.5), rgba(139,92,246,0.3), transparent)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '12px', lineHeight: 1.55, color: 'rgba(226,232,240,0.8)', marginBottom: '18px' }}>
                    {excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={LOGO_PATH} alt="Lucid Repo" style={{ width: '65%', height: 'auto', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar during video rendering */}
            {isSaving && canRecordVideo && progress > 0 && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            )}

            <div className="flex gap-2">
              {canRecordVideo && (
                <Button
                  onClick={handleSaveVideo}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{isSaving ? `Rendering ${Math.round(progress * 100)}%` : "Save Video"}</span>
                </Button>
              )}
              <Button
                onClick={handleSaveStatic}
                disabled={isSaving}
                variant={canRecordVideo ? "outline" : "default"}
                className={`${canRecordVideo ? "" : "flex-1"} flex items-center justify-center gap-2`}
              >
                <Save size={18} />
                <span>{canRecordVideo ? "Image" : isSaving ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DreamShareCard ref={shareCardRef} dream={normalizedDream} />
    </>
  );
};

export default ShareButton;

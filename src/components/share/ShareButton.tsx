import React, { useState, useRef } from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard, { DreamShareCardRef } from "./DreamShareCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share, Save } from "lucide-react";
import { toast } from "sonner";
import { elementToPngBase64, extractBase64FromDataUrl } from "@/utils/shareUtils";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share as CapacitorShare } from "@capacitor/share";

const LOGO_PATH = "/lovable-uploads/e94fd126-8216-43a0-a62d-cf081a8c036f.png";

interface ShareButtonProps {
  dream: DreamEntry;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const preloadImageAsDataUrl = async (src: string): Promise<string | null> => {
  try {
    const response = await fetch(src, { mode: 'cors', cache: 'force-cache' });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    console.warn("Failed to preload image as data URL:", src);
    return null;
  }
};

const ShareButton: React.FC<ShareButtonProps> = ({
  dream,
  variant = "outline",
  size = "default",
  className = ""
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dreamImageBase64, setDreamImageBase64] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [preloading, setPreloading] = useState(false);
  const shareCardRef = useRef<DreamShareCardRef>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);

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

  const handleShareClick = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setPreloading(true);
    setDreamImageBase64(null);
    setLogoBase64(null);

    try {
      setShowShareDialog(true);

      const logoAbsoluteUrl = `${window.location.origin}${LOGO_PATH}`;
      const promises: Promise<void>[] = [];

      promises.push(
        preloadImageAsDataUrl(logoAbsoluteUrl).then((data) => setLogoBase64(data))
      );

      if (dreamImageUrl) {
        promises.push(
          preloadImageAsDataUrl(dreamImageUrl).then((data) => setDreamImageBase64(data))
        );
      }

      await Promise.all(promises);
      toast.success("Share card generated!");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to generate share card");
    } finally {
      setIsSharing(false);
      setPreloading(false);
    }
  };

  const allImagesReady = !!logoBase64 && (!dreamImageUrl || !!dreamImageBase64);

  const handleSaveCard = async () => {
    if (!previewCardRef.current || isSaving) return;
    setIsSaving(true);

    try {
      await new Promise((r) => setTimeout(r, 500));

      const dialogContent = previewCardRef.current.closest('[class*="DialogContent"], [role="dialog"]') as HTMLElement | null;
      const originalOverflow = dialogContent?.style.overflow;
      if (dialogContent) dialogContent.style.overflow = 'visible';

      let dataUrl: string | null = null;
      try {
        dataUrl = await elementToPngBase64(previewCardRef.current);
      } finally {
        if (dialogContent && originalOverflow !== undefined) {
          dialogContent.style.overflow = originalOverflow;
        }
      }

      if (!dataUrl) throw new Error("Image capture failed");

      const base64Data = extractBase64FromDataUrl(dataUrl);
      const filename = `${normalizedDream.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`;

      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });
        await CapacitorShare.share({
          title: normalizedDream.title,
          text: `Check out my dream from Lucid Repo: ${normalizedDream.title}`,
          url: savedFile.uri,
          dialogTitle: 'Share Your Dream Card'
        });
        toast.success("Share card ready to share!");
      } else {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/png' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        <span>{isSharing ? "Generating..." : "Share"}</span>
      </Button>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm max-h-[95vh] overflow-y-auto p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center">Share Your Dream</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview card — mirrors DreamShareCard layout scaled down */}
            <div
              ref={previewCardRef}
              className="w-full mx-auto overflow-hidden relative"
              style={{
                aspectRatio: '9/16',
                borderRadius: '12px',
                background: '#060B18',
              }}
            >
              {/* Full-bleed image or fallback */}
              {dreamImageBase64 ? (
                <img
                  src={dreamImageBase64}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : !dreamImageUrl ? (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(165deg, #060B18 0%, #0C1629 40%, #111B33 100%)',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.06,
                    backgroundImage: 'radial-gradient(1.5px 1.5px at 15% 25%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(2px 2px at 50% 55%, rgba(96,165,250,0.6) 0%, transparent 100%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '40%',
                    background: 'radial-gradient(ellipse at center, rgba(56,130,246,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }} />
                </div>
              ) : null}

              {/* Bottom gradient */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '65%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.92) 100%)',
                pointerEvents: 'none',
              }} />

              {/* Text overlay with frosted glass */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 20px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: '50%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(6,11,24,0.4) 15%, rgba(6,11,24,0.7) 40%, rgba(6,11,24,0.88) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(96,165,250,0.12)',
              }}>
                <div style={{
                  fontSize: '9px',
                  letterSpacing: '4px',
                  textTransform: 'uppercase' as const,
                  color: 'rgba(96,165,250,0.7)',
                  fontFamily: 'monospace',
                  marginBottom: '10px',
                }}>
                  ✦ DREAM JOURNAL ✦
                </div>

                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                }}>
                  {normalizedDream.title}
                </h2>

                <p style={{
                  fontSize: '10px',
                  color: 'rgba(226,232,240,0.5)',
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                }}>
                  {formattedDate}
                </p>

                <div style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, rgba(96,165,250,0.5), rgba(139,92,246,0.3), transparent)',
                  marginBottom: '12px',
                }} />

                <p style={{
                  fontSize: '12px',
                  lineHeight: 1.55,
                  color: 'rgba(226,232,240,0.8)',
                  marginBottom: '18px',
                }}>
                  {excerpt}
                </p>

                {logoBase64 && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={logoBase64}
                      alt="Lucid Repo"
                      style={{ width: '65%', height: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveCard}
              disabled={isSaving || !allImagesReady || preloading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>{isSaving ? "Saving..." : !allImagesReady ? "Loading image..." : "Save"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DreamShareCard ref={shareCardRef} dream={normalizedDream} />
    </>
  );
};

export default ShareButton;

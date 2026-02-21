
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

  const handleShareClick = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setPreloading(true);
    setDreamImageBase64(null);
    setLogoBase64(null);

    try {
      setShowShareDialog(true);

      // Eagerly preload both images as base64
      const logoAbsoluteUrl = `${window.location.origin}${LOGO_PATH}`;
      const promises: Promise<void>[] = [];

      promises.push(
        preloadImageAsDataUrl(logoAbsoluteUrl).then((data) => {
          console.log("Logo preloaded:", !!data);
          setLogoBase64(data);
        })
      );

      if (normalizedDream.generatedImage) {
        promises.push(
          preloadImageAsDataUrl(normalizedDream.generatedImage).then((data) => {
            console.log("Dream image preloaded:", !!data);
            setDreamImageBase64(data);
          })
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

  // Ready when logo is loaded AND (no dream image OR dream image is loaded)
  const allImagesReady =
    !!logoBase64 && (!normalizedDream.generatedImage || !!dreamImageBase64);

  const handleSaveCard = async () => {
    if (!previewCardRef.current || isSaving) return;

    setIsSaving(true);

    try {
      console.log("Starting save process...");

      // Small settle delay for DOM to be fully painted with base64 srcs
      await new Promise((r) => setTimeout(r, 500));

      const dataUrl = await elementToPngBase64(previewCardRef.current);
      if (!dataUrl) {
        throw new Error("Failed to generate image");
      }

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

      setTimeout(() => {
        setShowShareDialog(false);
      }, 500);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save share card");
    } finally {
      setIsSaving(false);
    }
  };

  if (!normalizedDream.title || !normalizedDream.content) {
    return null;
  }

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
            <div
              ref={previewCardRef}
              className="w-full mx-auto"
              style={{ aspectRatio: '9/16' }}
            >
              <div
                className="w-full h-full overflow-hidden"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  background: 'linear-gradient(160deg, #0a0a1a 0%, #1a0e2e 30%, #0d1b2a 60%, #0a0a1a 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                {/* Starfield overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 50% 60%, rgba(139,92,246,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.25) 0%, transparent 100%), radial-gradient(1px 1px at 10% 90%, rgba(139,92,246,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 40% 15%, rgba(255,255,255,0.35) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 90% 45%, rgba(96,165,250,0.4) 0%, transparent 100%)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />

                {/* Aurora glow at top */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '120px',
                  background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.1) 50%, transparent 80%)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />

                {/* Content layer */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', fontFamily: 'monospace' }}>✦ Dream Journal ✦</span>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: '#e2e8f0', fontFamily: "'EB Garamond', serif", letterSpacing: '0.5px', textAlign: 'left' }}>
                      {normalizedDream.title}
                    </h2>
                    <p style={{ fontSize: '11px', color: 'rgba(139,92,246,0.6)', marginTop: '6px', textAlign: 'left', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {normalizedDream.date
                        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(normalizedDream.date))
                        : "Unknown Date"}
                    </p>
                  </div>

                  <div style={{
                    marginBottom: '14px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    
                  }}>
                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(226,232,240,0.85)', textAlign: 'left', fontFamily: "'Lora', serif" }}>
                      {normalizedDream.content.length > 200
                        ? normalizedDream.content.substring(0, 200) + "..."
                        : normalizedDream.content}
                    </p>
                  </div>

                  {normalizedDream.analysis && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ borderLeft: '2px solid rgba(139,92,246,0.5)', paddingLeft: '10px' }}>
                        <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'rgba(196,181,253,0.8)', textAlign: 'left', lineHeight: 1.5, fontFamily: "'Lora', serif" }}>
                          {normalizedDream.analysis.length > 120
                            ? normalizedDream.analysis.substring(0, 120) + "..."
                            : normalizedDream.analysis}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dream image — uses preloaded base64 */}
                  {normalizedDream.generatedImage && dreamImageBase64 && (
                    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 auto', minHeight: 0 }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '280px',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        position: 'relative',
                        border: '1px solid rgba(139,92,246,0.25)',
                        boxShadow: '0 0 30px rgba(139,92,246,0.15), 0 0 60px rgba(59,130,246,0.05)',
                      }}>
                        <img
                          src={dreamImageBase64}
                          alt="Dream Visualization"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '12px',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{
                    height: '1px',
                    flexShrink: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(96,165,250,0.3), transparent)',
                    marginBottom: '10px',
                  }} />

                  {/* Footer logo — uses preloaded base64 */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {logoBase64 && (
                      <img
                        src={logoBase64}
                        alt="Lucid Repo Logo"
                        style={{ height: '36px', width: 'auto', opacity: 0.9 }}
                      />
                    )}
                  </div>
                </div>
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

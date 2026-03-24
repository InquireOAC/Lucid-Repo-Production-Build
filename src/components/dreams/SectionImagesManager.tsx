import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Film, ImageIcon, RefreshCw, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GenerateVideoDialog } from "./GenerateVideoDialog";

interface SectionImage {
  section: number;
  text: string;
  image_url?: string;
  prompt?: string;
  video_url?: string;
}

interface SectionImagesManagerProps {
  dreamId: string;
  sectionImages: SectionImage[];
  onUpdate: (updated: SectionImage[]) => void;
  isMystic?: boolean;
}

const SectionImagesManager: React.FC<SectionImagesManagerProps> = ({
  dreamId,
  sectionImages,
  onUpdate,
  isMystic,
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; type: "image" | "video" } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoTargetIndex, setVideoTargetIndex] = useState<number | null>(null);
  const [regenerateIndex, setRegenerateIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const scenesWithMedia = sectionImages.filter(s => s.image_url);
  if (scenesWithMedia.length === 0) return null;

  const persistUpdate = async (updated: SectionImage[]) => {
    await supabase
      .from("dream_entries")
      .update({ section_images: updated as any })
      .eq("id", dreamId);
    onUpdate(updated);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = [...sectionImages];
      const sec = updated[deleteTarget.index];

      if (deleteTarget.type === "video" && sec.video_url) {
        // Delete video from storage
        try {
          const url = new URL(sec.video_url);
          const pathParts = url.pathname.split("/dream-videos/");
          if (pathParts.length > 1) {
            await supabase.storage.from("dream-videos").remove([decodeURIComponent(pathParts[1])]);
          }
        } catch {}
        updated[deleteTarget.index] = { ...sec, video_url: undefined };
        toast.success("Scene video deleted");
      } else if (deleteTarget.type === "image") {
        // Delete image from storage
        if (sec.image_url) {
          try {
            const url = new URL(sec.image_url);
            const pathParts = url.pathname.split("/dream-images/");
            if (pathParts.length > 1) {
              await supabase.storage.from("dream-images").remove([decodeURIComponent(pathParts[1])]);
            }
          } catch {}
        }
        // Also delete video if exists
        if (sec.video_url) {
          try {
            const url = new URL(sec.video_url);
            const pathParts = url.pathname.split("/dream-videos/");
            if (pathParts.length > 1) {
              await supabase.storage.from("dream-videos").remove([decodeURIComponent(pathParts[1])]);
            }
          } catch {}
        }
        updated[deleteTarget.index] = { ...sec, image_url: undefined, video_url: undefined, prompt: undefined };
        toast.success("Scene image deleted");
      }

      await persistUpdate(updated);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const sec = sectionImages[index];
      const promptToUse = editPrompt.trim() || sec.text || "";
      const { data: promptData, error: promptError } = await supabase.functions.invoke("compose-cinematic-prompt", {
        body: { sceneBrief: promptToUse },
      });
      if (promptError || !promptData?.cinematicPrompt) throw new Error("Failed to generate prompt");

      const { data: imgData, error: imgError } = await supabase.functions.invoke("generate-dream-image", {
        body: { prompt: promptData.cinematicPrompt },
      });
      if (imgError || !imgData?.imageUrl) throw new Error("Failed to generate image");

      const updated = [...sectionImages];
      updated[index] = { ...updated[index], image_url: imgData.imageUrl, prompt: promptData.cinematicPrompt, video_url: undefined };
      await persistUpdate(updated);
      setRegenerateIndex(null);
      toast.success("Scene image regenerated!");
    } catch (err: any) {
      toast.error(`Regeneration failed: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSectionVideoGenerated = async (index: number, videoUrl: string) => {
    const updated = [...sectionImages];
    updated[index] = { ...updated[index], video_url: videoUrl };
    await persistUpdate(updated);
    setShowVideoDialog(false);
    setVideoTargetIndex(null);
  };

  // Find original indices of scenes with media
  const mediaIndices = sectionImages
    .map((s, i) => s.image_url ? i : -1)
    .filter(i => i !== -1);

  const currentOriginalIndex = mediaIndices[activeSlide] ?? 0;
  const currentScene = sectionImages[currentOriginalIndex];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">Scene Images ({scenesWithMedia.length})</h4>
      </div>

      <Carousel opts={{ watchDrag: true }} setApi={setCarouselApi}>
        <CarouselContent>
          {mediaIndices.map((origIdx, slideIdx) => {
            const sec = sectionImages[origIdx];
            return (
              <CarouselItem key={origIdx}>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">Scene {sec.section}: {sec.text}</p>
                  <div className="rounded-xl overflow-hidden bg-black relative">
                    {sec.video_url ? (
                      <video
                        src={sec.video_url}
                        poster={sec.image_url}
                        autoPlay loop muted playsInline
                        className="w-full object-contain aspect-[9/16]"
                      />
                    ) : (
                      <img
                        src={sec.image_url}
                        alt={`Scene ${sec.section}`}
                        className="w-full object-contain aspect-[9/16]"
                      />
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      {scenesWithMedia.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {mediaIndices.map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block rounded-full transition-colors",
                i === activeSlide ? "bg-primary w-2 h-2" : "bg-muted-foreground/30 w-1.5 h-1.5"
              )}
            />
          ))}
        </div>
      )}

      {/* Actions for current scene */}
      {currentScene && (
        <div className="flex flex-wrap gap-2">
          {currentScene.video_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget({ index: currentOriginalIndex, type: "video" })}
              className="text-destructive hover:text-destructive h-8 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete Video
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteTarget({ index: currentOriginalIndex, type: "image" })}
            className="text-destructive hover:text-destructive h-8 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRegenerateIndex(currentOriginalIndex);
              setEditPrompt(currentScene.prompt || "");
            }}
            className="h-8 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
          </Button>
          {isMystic && currentScene.image_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setVideoTargetIndex(currentOriginalIndex);
                setShowVideoDialog(true);
              }}
              className="h-8 text-xs"
            >
              <Film className="h-3 w-3 mr-1" /> {currentScene.video_url ? "Regen Video" : "Gen Video"}
            </Button>
          )}
        </div>
      )}

      {/* Regenerate prompt editor */}
      {regenerateIndex !== null && (
        <div className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
          <Textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Customize the image prompt..."
            rows={3}
            className="resize-none text-sm"
            disabled={isRegenerating}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleRegenerate(regenerateIndex)} disabled={isRegenerating} className="gap-1.5">
              {isRegenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Regenerating...</> : <><RefreshCw className="h-3.5 w-3.5" /> Regenerate</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRegenerateIndex(null)} disabled={isRegenerating}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scene {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "video"
                ? "This will remove the video from this scene. You can regenerate it later from the image."
                : "This will remove the image and any associated video from this scene. You can regenerate them later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video generation dialog */}
      {videoTargetIndex !== null && sectionImages[videoTargetIndex]?.image_url && (
        <GenerateVideoDialog
          open={showVideoDialog}
          onOpenChange={(open) => { setShowVideoDialog(open); if (!open) setVideoTargetIndex(null); }}
          dreamId={dreamId}
          imageUrl={sectionImages[videoTargetIndex].image_url!}
          dreamContent={sectionImages[videoTargetIndex].text || ""}
          skipDreamUpdate
          onVideoGenerated={(url) => handleSectionVideoGenerated(videoTargetIndex, url)}
        />
      )}
    </div>
  );
};

export default SectionImagesManager;

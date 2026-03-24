import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Film, ImageIcon, RefreshCw, Loader2, Sparkles } from "lucide-react";
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
  dreamContent?: string;
  dreamTitle?: string;
}

const SectionImagesManager: React.FC<SectionImagesManagerProps> = ({
  dreamId,
  sectionImages,
  onUpdate,
  isMystic,
  dreamTitle,
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; type: "image" | "video" } | null>(null);
  const [deleteSceneTarget, setDeleteSceneTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoTargetIndex, setVideoTargetIndex] = useState<number | null>(null);
  const [regenerateIndex, setRegenerateIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const scenesWithMedia = sectionImages.filter(s => s.image_url);
  const scenesWithoutMedia = sectionImages
    .map((s, i) => ({ scene: s, originalIndex: i }))
    .filter(({ scene }) => !scene.image_url);

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
        if (sec.image_url) {
          try {
            const url = new URL(sec.image_url);
            const pathParts = url.pathname.split("/dream-images/");
            if (pathParts.length > 1) {
              await supabase.storage.from("dream-images").remove([decodeURIComponent(pathParts[1])]);
            }
          } catch {}
        }
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

  const handleConfirmDeleteScene = async () => {
    if (deleteSceneTarget === null) return;
    setIsDeleting(true);
    try {
      const sec = sectionImages[deleteSceneTarget];

      if (sec.image_url) {
        try {
          const url = new URL(sec.image_url);
          const pathParts = url.pathname.split("/dream-images/");
          if (pathParts.length > 1) {
            await supabase.storage.from("dream-images").remove([decodeURIComponent(pathParts[1])]);
          }
        } catch {}
      }
      if (sec.video_url) {
        try {
          const url = new URL(sec.video_url);
          const pathParts = url.pathname.split("/dream-videos/");
          if (pathParts.length > 1) {
            await supabase.storage.from("dream-videos").remove([decodeURIComponent(pathParts[1])]);
          }
        } catch {}
      }

      const updated = sectionImages.filter((_, i) => i !== deleteSceneTarget);
      await persistUpdate(updated);
      setActiveSlide(0);
      toast.success("Scene deleted");
    } catch (err) {
      console.error("Delete scene failed:", err);
      toast.error("Failed to delete scene");
    } finally {
      setIsDeleting(false);
      setDeleteSceneTarget(null);
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

  const handleGenerateImage = async (index: number) => {
    if (generatingIndex !== null) return;
    setGeneratingIndex(index);
    try {
      const sec = sectionImages[index];
      const sceneBrief = dreamTitle
        ? `Dream Title: ${dreamTitle}\n\nScene: ${sec.text}`
        : sec.text || "";

      const { data: promptData, error: promptError } = await supabase.functions.invoke("compose-cinematic-prompt", {
        body: { sceneBrief },
      });
      if (promptError || !promptData?.cinematicPrompt) throw new Error("Failed to generate prompt");

      const { data: imgData, error: imgError } = await supabase.functions.invoke("generate-dream-image", {
        body: { prompt: promptData.cinematicPrompt },
      });
      if (imgError || !imgData?.imageUrl) throw new Error("Failed to generate image");

      const updated = [...sectionImages];
      updated[index] = { ...updated[index], image_url: imgData.imageUrl, prompt: promptData.cinematicPrompt };
      await persistUpdate(updated);
      toast.success("Scene image generated!");
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setGeneratingIndex(null);
    }
  };

  const handleSectionVideoGenerated = async (index: number, videoUrl: string) => {
    const updated = [...sectionImages];
    updated[index] = { ...updated[index], video_url: videoUrl };
    await persistUpdate(updated);
    setShowVideoDialog(false);
    setVideoTargetIndex(null);
  };

  // Find original indices of scenes with media for carousel
  const mediaIndices = sectionImages
    .map((s, i) => s.image_url ? i : -1)
    .filter(i => i !== -1);

  const currentOriginalIndex = mediaIndices[activeSlide] ?? 0;
  const currentScene = scenesWithMedia.length > 0 ? sectionImages[currentOriginalIndex] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">
          Scene Images
          {sectionImages.length > 0 && (
            <span className="ml-1.5 text-muted-foreground font-normal">
              ({scenesWithMedia.length}/{sectionImages.length})
            </span>
          )}
        </h4>
      </div>

      {/* Carousel — only when some scenes have images */}
      {scenesWithMedia.length > 0 && (
        <>
          <Carousel opts={{ watchDrag: true }} setApi={setCarouselApi}>
            <CarouselContent>
              {mediaIndices.map((origIdx) => {
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

          {/* Actions for current carousel scene */}
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
                onClick={() => setDeleteSceneTarget(currentOriginalIndex)}
                className="text-destructive hover:text-destructive h-8 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete Scene
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
              <div className="flex gap-2 w-full">
                <Button size="sm" onClick={() => handleRegenerate(regenerateIndex)} disabled={isRegenerating} className="gap-1.5 flex-1 min-w-0">
                  {isRegenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" /> <span className="truncate">Regenerating…</span></> : <><RefreshCw className="h-3.5 w-3.5 flex-shrink-0" /> Regenerate</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRegenerateIndex(null)} disabled={isRegenerating} className="flex-shrink-0">Cancel</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Scenes without images */}
      {scenesWithoutMedia.length > 0 && (
        <div className="space-y-2">
          {scenesWithMedia.length > 0 && (
            <p className="text-xs text-muted-foreground font-medium">Scenes without images:</p>
          )}
          {scenesWithoutMedia.map(({ scene, originalIndex }) => (
            <div key={originalIndex} className="p-3 rounded-xl border border-border/40 bg-muted/10 space-y-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Scene {scene.section}:</span> {scene.text}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleGenerateImage(originalIndex)}
                  disabled={generatingIndex !== null || isRegenerating}
                  className="gap-1.5 flex-1"
                >
                  {generatingIndex === originalIndex ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-3 w-3" /> Generate Image</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteSceneTarget(originalIndex)}
                  disabled={generatingIndex !== null}
                  className="text-destructive hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete image/video confirmation */}
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

      {/* Delete scene confirmation */}
      <AlertDialog open={deleteSceneTarget !== null} onOpenChange={(open) => !open && setDeleteSceneTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scene?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this scene and any associated image or video. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteScene} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Scene"}
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

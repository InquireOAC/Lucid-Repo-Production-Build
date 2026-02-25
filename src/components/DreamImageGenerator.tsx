
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Download, Lock, Trash2, RefreshCw, Film } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useDreamImageGeneration } from "@/hooks/useDreamImageGeneration";
import ImageDisplay from "@/components/dreams/ImageDisplay";
import GeneratingImage from "@/components/dreams/GeneratingImage";
import ImagePromptInput from "@/components/dreams/ImagePromptInput";
import { GenerateVideoDialog } from "@/components/dreams/GenerateVideoDialog";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";

import { shareOrSaveImage } from "@/utils/shareOrSaveImage";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

import styleSurreal from "@/assets/styles/surreal.jpg";
import styleRealistic from "@/assets/styles/realistic.jpg";
import styleHyperRealism from "@/assets/styles/hyper_realism.jpg";
import styleAbstract from "@/assets/styles/abstract.jpg";
import styleImpressionist from "@/assets/styles/impressionist.jpg";
import styleFantasy from "@/assets/styles/fantasy.jpg";
import styleMinimalist from "@/assets/styles/minimalist.jpg";
import styleVintage from "@/assets/styles/vintage.jpg";
import styleCyberpunk from "@/assets/styles/cyberpunk.jpg";
import styleWatercolor from "@/assets/styles/watercolor.jpg";
import styleOilPainting from "@/assets/styles/oil_painting.jpg";
import styleDigitalArt from "@/assets/styles/digital_art.jpg";
import styleSketch from "@/assets/styles/sketch.jpg";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface DreamImageGeneratorProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
  dreamId?: string;
  existingVideoUrl?: string;
  onVideoGenerated?: (videoUrl: string) => void;
  onVideoDeleted?: () => void;
}

const styleOptions = [
{ value: "surreal", label: "Surreal", thumb: styleSurreal },
{ value: "realistic", label: "Realistic", thumb: styleRealistic },
{ value: "hyper_realism", label: "Hyper Realism", thumb: styleHyperRealism },
{ value: "abstract", label: "Abstract", thumb: styleAbstract },
{ value: "impressionist", label: "Impressionist", thumb: styleImpressionist },
{ value: "fantasy", label: "Fantasy", thumb: styleFantasy },
{ value: "minimalist", label: "Minimalist", thumb: styleMinimalist },
{ value: "vintage", label: "Vintage", thumb: styleVintage },
{ value: "cyberpunk", label: "Cyberpunk", thumb: styleCyberpunk },
{ value: "watercolor", label: "Watercolor", thumb: styleWatercolor },
{ value: "oil_painting", label: "Oil Painting", thumb: styleOilPainting },
{ value: "digital_art", label: "Digital Art", thumb: styleDigitalArt },
{ value: "sketch", label: "Sketch", thumb: styleSketch }];


const DreamImageGenerator = ({
  dreamContent,
  existingPrompt,
  existingImage,
  onImageGenerated,
  disabled = false,
  dreamId,
  existingVideoUrl,
  onVideoGenerated,
  onVideoDeleted,
}: DreamImageGeneratorProps) => {
  const { hasActiveSubscription } = useFeatureUsage();
  const {
    imagePrompt,
    setImagePrompt,
    generatedImage,
    isGenerating,
    showInfo,
    imageError,
    setImageError,
    generateImage,
    isAppCreator,
    hasUsedFeature,
    useAIContext,
    setUseAIContext,
    imageStyle,
    setImageStyle
  } = useDreamImageGeneration({
    dreamContent,
    existingPrompt,
    existingImage,
    onImageGenerated,
    disabled,
    dreamId
  });

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState(existingVideoUrl);

  React.useEffect(() => {
    setLocalVideoUrl(existingVideoUrl);
  }, [existingVideoUrl]);

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    return () => { carouselApi.off('select', onSelect); };
  }, [carouselApi]);

  const handleSaveAsPng = async () => {
    if (!generatedImage) {
      toast.error("No image available to save");
      return;
    }
    try {
      await shareOrSaveImage(generatedImage, "dream-image.png");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleDeleteVideo = async () => {
    if (!dreamId || !localVideoUrl) return;
    setIsDeletingVideo(true);
    try {
      // Extract file path from URL
      const url = new URL(localVideoUrl);
      const pathParts = url.pathname.split('/dream-videos/');
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1]);
        await supabase.storage.from('dream-videos').remove([filePath]);
      }
      // Clear video_url in DB
      const { error } = await supabase
        .from('dream_entries')
        .update({ video_url: null })
        .eq('id', dreamId);
      if (error) throw error;

      setLocalVideoUrl(undefined);
      onVideoDeleted?.();
      toast.success('Video deleted');
    } catch (err: any) {
      console.error('Failed to delete video:', err);
      toast.error('Failed to delete video');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const handleVideoGenerated = (videoUrl: string) => {
    setLocalVideoUrl(videoUrl);
    onVideoGenerated?.(videoUrl);
  };

  const isFeatureEnabled = isAppCreator || !hasUsedFeature("image") || hasActiveSubscription;
  const hasVideo = !!localVideoUrl;
  const totalSlides = hasVideo ? 2 : 1;

  // Dot indicators for carousel
  const DotIndicators = () => {
    if (totalSlides <= 1) return null;
    return (
      <div className="flex justify-center gap-1.5 pt-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "inline-block rounded-full transition-colors",
              i === activeSlide
                ? "bg-primary w-2 h-2"
                : "bg-muted-foreground/30 w-1.5 h-1.5"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ImagePlus className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">Dream Visualization</h3>
      </div>

      {/* Image/Video Area */}
      {isGenerating ? (
        <GeneratingImage />
      ) : generatedImage ? (
        <div className="space-y-3">
          {hasVideo ? (
            <>
              <Carousel opts={{ watchDrag: true }} setApi={setCarouselApi}>
                <CarouselContent>
                  {/* Slide 1: Image */}
                  <CarouselItem>
                    <ImageDisplay
                      imageUrl={generatedImage}
                      imageDataUrl={generatedImage}
                      onError={() => setImageError(true)}
                      disabled={disabled || isGenerating}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleSaveAsPng}>
                        <Download className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </CarouselItem>
                  {/* Slide 2: Video */}
                  <CarouselItem>
                    <div className="rounded-2xl overflow-hidden bg-black">
                      <video
                        src={localVideoUrl}
                        poster={generatedImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteVideo}
                        disabled={isDeletingVideo}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeletingVideo ? "Deleting..." : "Delete Video"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVideoDialog(true)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                      </Button>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              <DotIndicators />
            </>
          ) : (
            <>
              <ImageDisplay
                imageUrl={generatedImage}
                imageDataUrl={generatedImage}
                onError={() => setImageError(true)}
                disabled={disabled || isGenerating}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveAsPng}>
                  <Download className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </>
          )}
          {imageError && (
            <p className="text-xs text-destructive text-center">
              There was an issue with the image. Please try regenerating.
            </p>
          )}
        </div>
      ) : (
        /* Empty State Placeholder */
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-muted/80 to-muted/40 border border-border/50">
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground/80">No image generated yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap 'Generate' to visualize this dream
              </p>
            </div>
          </div>
          <div className="px-4 pb-4">
            {!disabled && isFeatureEnabled ? (
              <Button
                onClick={generateImage}
                className="w-full gap-2"
                variant="aurora"
              >
                Auto-Generate Image
              </Button>
            ) : !disabled ? (
              <Button
                onClick={() => {}}
                variant="outline"
                className="w-full gap-2"
              >
                <Lock className="h-4 w-4" />
                Subscribe to Generate
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Prompt Input - always visible when not disabled */}
      {!disabled && !isGenerating && (
        <ImagePromptInput
          imagePrompt={imagePrompt}
          onChange={setImagePrompt}
          disabled={disabled || isGenerating}
          onRegenerate={generateImage}
          isGenerating={isGenerating}
        />
      )}

      {/* Use Avatar Toggle */}
      {!disabled && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div>
              <p className="text-sm font-medium">Use Avatar</p>
              <p className="text-xs text-muted-foreground">Include your likeness</p>
            </div>
          </div>
          <Switch
            checked={useAIContext}
            onCheckedChange={setUseAIContext}
          />
        </div>
      )}

      {/* Visual Style - Horizontal Thumbnails */}
      {!disabled && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Style</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {styleOptions.map((style) => (
              <button
                type="button"
                key={style.value}
                onClick={() => setImageStyle(style.value)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5 group"
                )}
              >
                <div
                  className={cn(
                    "w-[72px] h-[72px] rounded-xl border-2 transition-all overflow-hidden",
                    imageStyle === style.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <img
                    src={style.thumb}
                    alt={style.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={cn(
                  "text-[10px] leading-tight",
                  imageStyle === style.value ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {style.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Generation Dialog */}
      {dreamId && generatedImage && (
        <GenerateVideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          dreamId={dreamId}
          imageUrl={generatedImage}
          onVideoGenerated={handleVideoGenerated}
          dreamContent={dreamContent}
        />
      )}
    </div>
  );
};

export default DreamImageGenerator;

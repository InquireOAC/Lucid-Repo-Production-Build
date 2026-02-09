
import React from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Download, Wand2, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useDreamImageGeneration } from "@/hooks/useDreamImageGeneration";
import ImageDisplay from "@/components/dreams/ImageDisplay";
import GeneratingImage from "@/components/dreams/GeneratingImage";
import ImagePromptInput from "@/components/dreams/ImagePromptInput";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";

import { shareOrSaveImage } from "@/utils/shareOrSaveImage";
import { cn } from "@/lib/utils";

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

interface DreamImageGeneratorProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
  dreamId?: string;
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
  { value: "sketch", label: "Sketch", thumb: styleSketch },
];

const DreamImageGenerator = ({
  dreamContent,
  existingPrompt,
  existingImage,
  onImageGenerated,
  disabled = false,
  dreamId,
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
    setImageStyle,
  } = useDreamImageGeneration({
    dreamContent,
    existingPrompt,
    existingImage,
    onImageGenerated,
    disabled,
    dreamId,
  });

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

  const isFeatureEnabled = isAppCreator || !hasUsedFeature("image") || hasActiveSubscription;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ImagePlus className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">Dream Visualization</h3>
      </div>

      {/* Image Area */}
      {isGenerating ? (
        <GeneratingImage />
      ) : generatedImage ? (
        <div className="space-y-3">
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
            {!disabled && (
              <Button variant="outline" size="sm" onClick={generateImage} disabled={isGenerating}>
                <Wand2 className="h-4 w-4 mr-1" /> Regenerate
              </Button>
            )}
          </div>
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
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImagePlus className="h-6 w-6 text-primary/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80">No image generated yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap 'Generate' to visualize this dream
              </p>
            </div>
          </div>
          {/* Generate Button inside placeholder */}
          <div className="px-4 pb-4">
            {!disabled && isFeatureEnabled ? (
              <Button
                onClick={generateImage}
                className="w-full gap-2"
                variant="aurora"
              >
                <Wand2 className="h-4 w-4" />
                Generate Image
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

      {/* Prompt input when image exists */}
      {generatedImage && !isGenerating && (
        <ImagePromptInput
          imagePrompt={imagePrompt}
          onChange={setImagePrompt}
          disabled={disabled || isGenerating}
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
                key={style.value}
                onClick={() => setImageStyle(style.value)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5 group",
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
    </div>
  );
};

export default DreamImageGenerator;


import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ImagePlus, Download, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { useDreamImageGeneration } from "@/hooks/useDreamImageGeneration";
import InitialImagePrompt from "@/components/dreams/InitialImagePrompt";
import ImageDisplay from "@/components/dreams/ImageDisplay";
import GeneratingImage from "@/components/dreams/GeneratingImage";
import ImagePromptInput from "@/components/dreams/ImagePromptInput";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";

import { shareOrSaveImage } from "@/utils/shareOrSaveImage";

interface DreamImageGeneratorProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
  dreamId?: string;
}

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
      console.log("Attempting to save image:", generatedImage);
      await shareOrSaveImage(generatedImage, "dream-image.png");
    } catch (error) {
      console.error("Save failed:", error);
      // Error handling is now done in shareOrSaveImage utility
    }
  };

  const styleOptions = [
    { value: "surreal", label: "Surreal" },
    { value: "realistic", label: "Realistic" },
    { value: "hyper_realism", label: "Hyper Realism" },
    { value: "abstract", label: "Abstract" },
    { value: "impressionist", label: "Impressionist" },
    { value: "fantasy", label: "Fantasy" },
    { value: "minimalist", label: "Minimalist" },
    { value: "vintage", label: "Vintage" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "watercolor", label: "Watercolor" },
    { value: "oil_painting", label: "Oil Painting" },
    { value: "digital_art", label: "Digital Art" },
    { value: "sketch", label: "Sketch" },
  ];

  if (showInfo && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ImagePlus className="h-5 w-5 mr-2 text-dream-purple" />
            Dream Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InitialImagePrompt
            disabled={disabled}
            hasUsedFeature={hasUsedFeature("image")}
            isAppCreator={isAppCreator}
            hasActiveSubscription={hasActiveSubscription}
            onGenerate={generateImage}
          />
          
          {/* AI Context Toggle - now visible in initial state */}
          {!disabled && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/30 rounded-lg">
              <Switch
                id="use-ai-context-initial"
                checked={useAIContext}
                onCheckedChange={setUseAIContext}
              />
              <Label htmlFor="use-ai-context-initial" className="text-sm cursor-pointer">
                Use my avatar appearance in images
              </Label>
            </div>
          )}

          {/* Image Style Selection */}
          {!disabled && (
            <div className="space-y-2 mb-4">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Image Style
              </Label>
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose art style" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <ImageDisplay
            imageUrl=""
            imageDataUrl=""
            onError={() => setImageError(true)}
            disabled={disabled || isGenerating}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <ImagePlus className="h-5 w-5 mr-2 text-dream-purple" />
          Dream Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <GeneratingImage />
        ) : (
          <>
            <ImageDisplay
              imageUrl={generatedImage || ""}
              imageDataUrl={generatedImage}
              onError={() => setImageError(true)}
              disabled={disabled || isGenerating}
            />
            {generatedImage && (
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveAsPng}
                >
                  <Download className="h-4 w-4 mr-1" /> Save as PNG
                </Button>
              </div>
            )}
            
            {/* AI Context Toggle */}
            {!disabled && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/30 rounded-lg">
                <Switch
                  id="use-ai-context"
                  checked={useAIContext}
                  onCheckedChange={setUseAIContext}
                />
                <Label htmlFor="use-ai-context" className="text-sm cursor-pointer">
                  Use my avatar appearance in images
                </Label>
              </div>
            )}

            {/* Image Style Selection */}
            {!disabled && (
              <div className="space-y-2 mb-4">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Image Style
                </Label>
                <Select value={imageStyle} onValueChange={setImageStyle}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose art style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(generatedImage || isGenerating || imagePrompt) && (
              <ImagePromptInput
                imagePrompt={imagePrompt}
                onChange={setImagePrompt}
                disabled={disabled || isGenerating}
              />
            )}
            {!disabled && (generatedImage || imagePrompt) && !isGenerating && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={generateImage} disabled={isGenerating}>
                  <Sparkles className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              </div>
            )}
            {imageError && !isGenerating && (
              <p className="text-xs text-red-500 mt-1 text-center">
                There was an issue with the image. Please try regenerating.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamImageGenerator;


import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ImagePlus, Download } from "lucide-react";
import { toast } from "sonner";

import { useDreamImageGeneration } from "@/hooks/useDreamImageGeneration";
import InitialImagePrompt from "@/components/dreams/InitialImagePrompt";
import ImageDisplay from "@/components/dreams/ImageDisplay";
import GeneratingImage from "@/components/dreams/GeneratingImage";
import ImagePromptInput from "@/components/dreams/ImagePromptInput";

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
            onGenerate={generateImage}
          />
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

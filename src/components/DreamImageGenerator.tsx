
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ImagePlus, Download } from "lucide-react";

import { useDreamImageGeneration } from "@/hooks/useDreamImageGeneration";
import InitialImagePrompt from "@/components/dreams/InitialImagePrompt";
import ImageDisplay from "@/components/dreams/ImageDisplay";
import GeneratingImage from "@/components/dreams/GeneratingImage";
import ImagePromptInput from "@/components/dreams/ImagePromptInput";
import { toast } from "sonner";

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
    handleImageFromFile,
  } = useDreamImageGeneration({
    dreamContent,
    existingPrompt,
    existingImage,
    onImageGenerated,
    disabled,
    dreamId,
  });

  const onImageFileUpload = async (base64DataUrl: string) => {
    await handleImageFromFile(base64DataUrl);
  };

  // Download PNG if available (PNG only by our upload logic)
  const handleSaveAsPng = () => {
    if (generatedImage && generatedImage.startsWith("http")) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "dream-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          {/* Always show file upload option even if dream has no image yet */}
          <ImageDisplay
            imageUrl=""
            imageDataUrl=""
            onError={() => setImageError(true)}
            onImageChange={onImageFileUpload}
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
              onImageChange={onImageFileUpload}
              disabled={disabled || isGenerating}
            />
            {/* Show Save as PNG button if image is a URL */}
            {generatedImage && generatedImage.startsWith("http") && (
              <Button variant="outline" size="sm" onClick={handleSaveAsPng}>
                <Download className="h-4 w-4 mr-1" /> Save as PNG
              </Button>
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
                There was an issue with the image. Please try regenerating or load your saved PNG.
              </p>
            )}
            {/* Always show Upload button at the bottom for convenience */}
            {!disabled && (
              <div className="flex flex-col items-center mt-2 gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => { /* handled by ImageDisplay */ }}>
                  Or Upload a New Image
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamImageGenerator;

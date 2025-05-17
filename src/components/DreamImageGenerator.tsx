import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ImagePlus, Download } from "lucide-react";

// Import refactored hook and components
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
  dreamId?: string; // Pass dreamId for context
}

const DreamImageGenerator = ({
  dreamContent,
  existingPrompt,
  existingImage,
  onImageGenerated,
  disabled = false,
  dreamId
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
    handleImageFromFile // new from hook
  } = useDreamImageGeneration({
    dreamContent,
    existingPrompt,
    existingImage,
    onImageGenerated,
    disabled,
    dreamId 
  });

  // direct to the new handler, which uploads-to-Supabase & returns URL
  const onImageFileUpload = async (base64DataUrl: string) => {
    await handleImageFromFile(base64DataUrl);
  };

  // Helper to generate download of PNG (works if generatedImage is a base64 PNG)
  const handleSaveAsPng = () => {
    if (generatedImage && generatedImage.startsWith("data:image/")) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "dream-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (showInfo && !isGenerating) { // Check !isGenerating to avoid flicker
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
            hasUsedFeature={hasUsedFeature('image')}
            isAppCreator={isAppCreator}
            onGenerate={generateImage}
          />
        </CardContent>
      </Card>
    );
  }

  // Pass both imageUrl and generatedImage as imageDataUrl (always base64 after our hook fix)
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
            {generatedImage && (
              <div className="flex flex-col gap-2">
                <ImageDisplay 
                  imageUrl={generatedImage} 
                  imageDataUrl={generatedImage}
                  onError={() => setImageError(true)} 
                  onImageChange={onImageFileUpload}
                />
                {/* Show Save as PNG button if image is base64 png url */}
                {generatedImage.startsWith("http") && (
                  <Button variant="outline" size="sm" onClick={handleSaveAsPng}>
                    <Download className="h-4 w-4 mr-1" /> Save as PNG
                  </Button>
                )}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateImage}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              </div>
            )}
            {imageError && !isGenerating && (
                <p className="text-xs text-red-500 mt-1 text-center">
                    There was an issue with the image. Please try regenerating or load your saved PNG.
                </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
export default DreamImageGenerator;

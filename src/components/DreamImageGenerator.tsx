
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ImagePlus } from "lucide-react";

// Import refactored hook and components
import { useDreamImageGeneration } from "@/hooks/useDreamImageGeneration";
import InitialImagePrompt from "@/components/dreams/InitialImagePrompt";
import ImageDisplay from "@/components/dreams/ImageDisplay";
import GeneratingImage from "@/components/dreams/GeneratingImage";
import ImagePromptInput from "@/components/dreams/ImagePromptInput";

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
    hasUsedFeature
  } = useDreamImageGeneration({
    dreamContent,
    existingPrompt,
    existingImage,
    onImageGenerated,
    disabled,
    dreamId 
  });

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
              <ImageDisplay 
                imageUrl={generatedImage} 
                // If ImageDisplay itself has an error (e.g. broken link after generation),
                // it can call setImageError to update the hook's state.
                onError={() => setImageError(true)} 
              />
            )}
            
            {/* Display prompt input only if an image has been generated or is being generated, or if there's an existing prompt */}
            {(generatedImage || isGenerating || imagePrompt) && (
              <ImagePromptInput
                imagePrompt={imagePrompt}
                onChange={setImagePrompt}
                disabled={disabled || isGenerating} // Also disable if generating
              />
            )}
            
            {!disabled && (generatedImage || imagePrompt) && !isGenerating && ( // Show regenerate only if there's an image/prompt and not generating
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateImage}
                  disabled={isGenerating} // Redundant due to outer check, but good practice
                >
                  <Sparkles className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              </div>
            )}
            {imageError && !isGenerating && ( // Show general error message if imageError is true and not generating
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

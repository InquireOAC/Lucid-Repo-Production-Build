
import React from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface InitialImagePromptProps {
  disabled: boolean;
  hasUsedFeature: boolean;
  isAppCreator: boolean;
  onGenerate: () => void;
}

const InitialImagePrompt = ({ 
  disabled, 
  hasUsedFeature, 
  isAppCreator, 
  onGenerate 
}: InitialImagePromptProps) => {
  return (
    <div className="text-center space-y-4 py-2">
      <p className="text-sm text-muted-foreground">
        {disabled
          ? "Only the dream owner can generate an image for this dream."
          : hasUsedFeature && !isAppCreator
            ? "You've used your free image generation. Subscribe to generate more dream images."
            : "Generate a unique image inspired by your dream's content. (Free trial available)"
        }
      </p>
      {!disabled && (
        <Button
          onClick={onGenerate}
          className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          {hasUsedFeature && !isAppCreator ? "Subscribe to Generate" : "Generate Image"}
        </Button>
      )}
    </div>
  );
};

export default InitialImagePrompt;

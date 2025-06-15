
import React from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Lock } from "lucide-react";
import { showSubscriptionPrompt } from "@/lib/stripe";

interface InitialImagePromptProps {
  disabled: boolean;
  hasUsedFeature: boolean;
  isAppCreator: boolean;
  hasActiveSubscription: boolean;
  onGenerate: () => void;
}

const InitialImagePrompt = ({ 
  disabled, 
  hasUsedFeature, 
  isAppCreator, 
  hasActiveSubscription,
  onGenerate 
}: InitialImagePromptProps) => {
  // Determine if feature is enabled based on subscription status
  const isFeatureEnabled = isAppCreator || !hasUsedFeature || hasActiveSubscription;

  console.log('InitialImagePrompt - Feature check:', {
    disabled,
    hasUsedFeature,
    isAppCreator,
    hasActiveSubscription,
    isFeatureEnabled
  });

  return (
    <div className="text-center space-y-4 py-2">
      <p className="text-sm text-muted-foreground">
        {disabled
          ? "Only the dream owner can generate an image for this dream."
          : !isFeatureEnabled
            ? "You've used your free image generation. Subscribe to generate more dream images."
            : "Generate a unique image inspired by your dream's content. (Free trial available)"
        }
      </p>
      {!disabled && isFeatureEnabled && (
        <Button
          onClick={onGenerate}
          className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Generate Image
        </Button>
      )}
      {!disabled && !isFeatureEnabled && (
        <Button
          onClick={() => showSubscriptionPrompt('image')}
          variant="outline"
          className="border-dream-purple text-dream-purple hover:bg-dream-purple hover:text-white"
        >
          <Lock className="h-4 w-4 mr-2" />
          Subscribe to Generate
        </Button>
      )}
    </div>
  );
};

export default InitialImagePrompt;

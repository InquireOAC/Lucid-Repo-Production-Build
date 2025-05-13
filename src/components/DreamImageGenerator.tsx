import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, ImagePlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { uploadDreamImage, preloadImage } from "@/utils/imageUtils";

interface DreamImageGeneratorProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
}

const DreamImageGenerator = ({
  dreamContent,
  existingPrompt = "",
  existingImage = "",
  onImageGenerated,
  disabled = false
}: DreamImageGeneratorProps) => {
  const { user } = useAuth();
  const { hasUsedFeature, markFeatureAsUsed, canUseFeature } = useFeatureUsage();
  const [imagePrompt, setImagePrompt] = useState(existingPrompt);
  const [generatedImage, setGeneratedImage] = useState(existingImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(!existingImage);
  
  // When the component mounts or the image changes, ensure we preload it
  useEffect(() => {
    if (existingImage) {
      setGeneratedImage(existingImage);
      setShowInfo(false);
      
      // Preload the image to ensure it's in browser cache
      preloadImage(existingImage);
    }
  }, [existingImage]);

  const generateImage = async () => {
    if (!user || disabled) return;

    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for image generation.");
      return;
    }
    
    try {
      // Special case for app creator - bypass the feature usage check
      const isAppCreator = user.email === "inquireoac@gmail.com";
      
      // Check if user can use the feature (free trial, subscription, or is app creator)
      const canUse = isAppCreator || await canUseFeature('image');
      
      if (!canUse) {
        // User has used their free trial and doesn't have a subscription
        showSubscriptionPrompt('image');
        return;
      }
      
      setIsGenerating(true);
      setShowInfo(false);
      
      // First, generate a prompt for the image using OpenAI
      const promptResult = await supabase.functions.invoke('analyze-dream', {
        body: { 
          dreamContent, 
          task: 'create_image_prompt' 
        }
      });
      
      if (promptResult.error) {
        throw new Error(promptResult.error.message || 'Failed to generate image prompt');
      }
      
      const generatedPrompt = promptResult.data?.analysis || '';
      if (!generatedPrompt) {
        throw new Error('No image prompt was generated');
      }
      
      setImagePrompt(generatedPrompt);
      console.log("Generated prompt:", generatedPrompt);
      
      // Then, generate the image using the prompt and Dall-E
      const imageResult = await supabase.functions.invoke('generate-dream-image', {
        body: { prompt: generatedPrompt }
      });
      
      if (imageResult.error) {
        console.error("Image generation API error:", imageResult.error);
        throw new Error(imageResult.error.message || 'Failed to generate image');
      }
      
      // Check both possible response formats
      const openaiUrl = imageResult.data?.imageUrl || imageResult.data?.image_url;
      console.log("Image result data:", imageResult.data);
      
      if (!openaiUrl) {
        throw new Error('No image URL was returned');
      }
      
      // Use a dreamId based on the user ID if we don't have one yet
      const dreamIdForStorage = user.id;
      
      // Upload directly to Supabase storage for permanent storage
      console.log("Starting upload to Supabase storage for permanent keeping");
      const uploadedUrl = await uploadDreamImage(dreamIdForStorage, openaiUrl);
      
      if (!uploadedUrl) {
        throw new Error("Failed to save image permanently");
      }
      
      console.log("Image saved permanently:", uploadedUrl);
      setGeneratedImage(uploadedUrl);
      
      // Notify the parent component that an image was generated
      onImageGenerated(uploadedUrl, generatedPrompt);
      
      // If this was a free trial use and not the app creator, mark the feature as used
      if (!isAppCreator && !hasUsedFeature('image')) {
        markFeatureAsUsed('image');
        toast.success("Free trial used! Subscribe to continue generating dream images.", {
          duration: 5000,
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = '/profile?tab=subscription'
          }
        });
      } else {
        toast.success("Dream image generated!");
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast.error(`Image generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showInfo && !generatedImage && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ImagePlus className="h-5 w-5 mr-2 text-dream-purple" />
            Dream Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {disabled
                ? "Only the dream owner can generate an image for this dream."
                : hasUsedFeature('image') && user?.email !== "inquireoac@gmail.com"
                  ? "You've used your free image generation. Subscribe to generate more dream images."
                  : "Generate a unique image inspired by your dream's content. (Free trial available)"
              }
            </p>
            {!disabled && (
              <Button
                onClick={generateImage}
                className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                {hasUsedFeature('image') && user?.email !== "inquireoac@gmail.com" ? "Subscribe to Generate" : "Generate Image"}
              </Button>
            )}
          </div>
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
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
            <p className="mt-2 text-sm text-muted-foreground">
              Generating your dream image...
            </p>
          </div>
        ) : (
          <>
            {/* Show the generated image */}
            {generatedImage && (
              <div className="mb-4">
                <img
                  src={generatedImage}
                  alt="Dream"
                  className="w-full rounded-md aspect-square object-cover"
                  onError={(e) => {
                    console.error("Image load error", e);
                    const img = e.currentTarget;
                    img.src = "https://via.placeholder.com/400?text=Image+Error";
                  }}
                />
              </div>
            )}
            
            <Input
              type="text"
              placeholder="Generated Prompt"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="dream-input mb-3"
              disabled={disabled}
            />
            
            {!disabled && (
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamImageGenerator;

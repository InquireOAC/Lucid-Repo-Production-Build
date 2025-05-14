import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ImagePlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { uploadDreamImage, preloadImage } from "@/utils/imageUtils";

// Import refactored components
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
  const [imageError, setImageError] = useState(false);
  
  // When the component mounts or the image changes, ensure we preload it
  useEffect(() => {
    if (existingImage) {
      setGeneratedImage(existingImage);
      setShowInfo(false);
      setImageError(false);
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
      setImageError(false);
      
      // Generate a prompt for the image using OpenAI
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
      
      // Generate the image using the prompt and Dall-E
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
      
      // Immediately display the image from OpenAI
      setGeneratedImage(openaiUrl);
      
      // If this is a free trial use and not the app creator, mark the feature as used
      if (!isAppCreator && !hasUsedFeature('image')) {
        markFeatureAsUsed('image');
      }
      
      try {
        // Use the new uploadDreamImage utility to save to Supabase storage
        const storedImageUrl = await uploadDreamImage("preview", openaiUrl);
        
        if (!storedImageUrl) {
          console.error("Image upload to Supabase failed");
          // We still continue with the OpenAI URL as fallback
          onImageGenerated(openaiUrl, generatedPrompt);
        } else {
          console.log("Image saved to Supabase:", storedImageUrl);
          setGeneratedImage(storedImageUrl);
          onImageGenerated(storedImageUrl, generatedPrompt);
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        // Still notify with the OpenAI URL as fallback
        onImageGenerated(openaiUrl, generatedPrompt);
      }
      
      toast.success("Dream image generated!");
      
      if (!isAppCreator && !hasUsedFeature('image')) {
        toast.success("Free trial used! Subscribe to continue generating dream images.", {
          duration: 5000,
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = '/profile?tab=subscription'
          }
        });
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      setImageError(true);
      toast.error(`Image generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine if user is app creator
  const isAppCreator = user?.email === "inquireoac@gmail.com";

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
                onError={() => setImageError(true)} 
              />
            )}
            
            <ImagePromptInput
              imagePrompt={imagePrompt}
              onChange={setImagePrompt}
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

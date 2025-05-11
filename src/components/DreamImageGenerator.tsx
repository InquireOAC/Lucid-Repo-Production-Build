
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";

interface DreamImageGeneratorProps {
  dreamContent: string;
  existingPrompt?: string;
  existingImage?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
}

const DreamImageGenerator = ({
  dreamContent,
  existingPrompt,
  existingImage,
  onImageGenerated,
}: DreamImageGeneratorProps) => {
  const [prompt, setPrompt] = useState(existingPrompt || "");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(existingImage);
  const { hasUsedFeature, markFeatureAsUsed, canUseFeature } = useFeatureUsage();

  const handleSuggestPrompt = async () => {
    setLoading(true);
    try {
      // Check if the user has access to this feature
      const hasAccess = await canUseFeature('image');
      if (!hasAccess) {
        if (hasUsedFeature('image')) {
          showSubscriptionPrompt('image');
        } else {
          markFeatureAsUsed('image');
          toast.success("Using your free trial!", { duration: 3000 });
        }
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { 
          dreamContent,
          task: 'create_image_prompt'
        }
      });

      if (error) throw error;
      setPrompt(data.analysis);
      
      // If this was a free trial use, mark the feature as used
      if (!hasUsedFeature('image')) {
        markFeatureAsUsed('image');
        toast.success("Free trial used! Subscribe for more image generations.", {
          duration: 5000,
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = '/profile?tab=subscription'
          }
        });
      } else {
        toast.success("Prompt suggestion created!");
      }
    } catch (error) {
      console.error("Error suggesting prompt:", error);
      toast.error("Failed to suggest prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }

    setLoading(true);
    try {
      // Check if the user has access to this feature
      const hasAccess = await canUseFeature('image');
      if (!hasAccess) {
        showSubscriptionPrompt('image');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-dream-image', {
        body: { prompt }
      });

      if (error) throw error;
      
      // If user has a subscription, increment usage counter
      const { data: customerData } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user?.id)
        .maybeSingle();
        
      if (customerData?.customer_id) {
        await supabase.rpc('increment_subscription_usage', { 
          customer_id: customerData.customer_id,
          credit_type: 'image'
        });
      }
      
      setImageUrl(data.imageUrl);
      onImageGenerated(data.imageUrl, prompt);
      toast.success("Dream image generated!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Pencil size={18} />
          Dream Visualization
        </h3>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Describe how your dream should look..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="dream-input flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSuggestPrompt}
              className="whitespace-nowrap border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
              disabled={loading}
            >
              {hasUsedFeature('image') ? "Get Premium" : "Suggest Prompt"}
            </Button>
          </div>
          <Button
            onClick={handleGenerateImage}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
          >
            {loading ? "Generating..." : hasUsedFeature('image') ? "Subscribe to Generate" : "Generate Image"}
          </Button>
          {hasUsedFeature('image') && !imageUrl && (
            <p className="text-xs text-center text-muted-foreground">
              You've used your free trial. Subscribe for more image generations.
            </p>
          )}
        </div>

        {imageUrl && (
          <Card className="overflow-hidden bg-dream-purple/5 border-dream-lavender/20">
            <CardContent className="p-0">
              <img
                src={imageUrl}
                alt="Generated dream visualization"
                className="w-full h-auto object-cover"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DreamImageGenerator;

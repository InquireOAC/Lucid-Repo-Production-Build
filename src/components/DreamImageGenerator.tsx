
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSuggestPrompt = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { 
          dreamContent,
          task: 'create_image_prompt'
        }
      });

      if (error) throw error;
      setPrompt(data.analysis);
      toast.success("Prompt suggestion created!");
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
      const { data, error } = await supabase.functions.invoke('generate-dream-image', {
        body: { prompt }
      });

      if (error) throw error;
      
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
            >
              Suggest Prompt
            </Button>
          </div>
          <Button
            onClick={handleGenerateImage}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
          >
            {loading ? "Generating..." : "Generate Image"}
          </Button>
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

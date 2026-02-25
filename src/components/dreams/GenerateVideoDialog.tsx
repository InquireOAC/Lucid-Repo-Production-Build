import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Video, Loader2, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerateVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dreamId: string;
  imageUrl: string;
  onVideoGenerated?: (videoUrl: string) => void;
  dreamContent?: string;
}

export const GenerateVideoDialog = ({
  open,
  onOpenChange,
  dreamId,
  imageUrl,
  onVideoGenerated,
  dreamContent,
}: GenerateVideoDialogProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCraftingPrompt, setIsCraftingPrompt] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-generate animation prompt when dialog opens
  useEffect(() => {
    if (!open) return;
    
    const craftPrompt = async () => {
      setIsCraftingPrompt(true);
      try {
        const { data, error } = await supabase.functions.invoke('compose-animation-prompt', {
          body: { dreamContent: dreamContent || '', imageUrl },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (data?.prompt) {
          setPrompt(data.prompt);
        }
      } catch (err: any) {
        console.error('Failed to craft animation prompt:', err);
        // Silent fallback — user can type their own
      } finally {
        setIsCraftingPrompt(false);
      }
    };

    setPrompt('');
    craftPrompt();
  }, [open, dreamContent, imageUrl]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90));
    }, 2000);

    try {
      const { data, error } = await supabase.functions.invoke('generate-dream-video', {
        body: {
          dreamId,
          imageUrl,
          animationPrompt: prompt || undefined,
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      toast.success('Dream video generated!');
      onVideoGenerated?.(data.videoUrl);
      
      setTimeout(() => {
        onOpenChange(false);
        setProgress(0);
        setPrompt('');
        setIsGenerating(false);
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Video generation failed:', err);
      toast.error(err.message || 'Failed to generate video');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Generate Dream Video
          </DialogTitle>
          <DialogDescription>
            Animate your dream image into a short video using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt="Dream to animate"
              className="w-full h-40 object-cover"
            />
          </div>

          <div className="relative">
            {isCraftingPrompt && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md z-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wand2 className="h-4 w-4 animate-pulse" />
                  AI is analyzing your dream...
                </div>
              </div>
            )}
            <Textarea
              placeholder="Describe the animation... e.g. 'The scene slowly pans across the dreamscape with gentle movement'"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isGenerating || isCraftingPrompt}
              rows={3}
              className="resize-none"
            />
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Generating video... This may take 1-2 minutes
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isCraftingPrompt}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

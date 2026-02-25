import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Video, Loader2, Sparkles, Wand2, X, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)] shadow-2xl shadow-primary/10">
          {/* Hero image with gradient overlay */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={imageUrl}
              alt="Dream to animate"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,12%)] via-[hsl(220,20%,12%)]/60 to-transparent" />
            
            {/* Close button */}
            <button
              onClick={() => !isGenerating && onOpenChange(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title overlay */}
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/20 backdrop-blur-sm border border-primary/30">
                  <Film className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  Dream Cinema
                </h2>
              </div>
              <p className="text-xs text-white/50 pl-[38px]">
                AI-powered animation from your dream image
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Prompt section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Animation Directive
                </label>
                <AnimatePresence>
                  {isCraftingPrompt && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-1.5"
                    >
                      <Wand2 className="h-3 w-3 text-primary animate-pulse" />
                      <span className="text-xs text-primary/80">Crafting...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative group">
                <Textarea
                  placeholder="Describe the motion... e.g. 'Slow cinematic pan with gentle atmospheric particles'"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={isGenerating || isCraftingPrompt}
                  rows={3}
                  className="resize-none bg-white/[0.04] border-white/[0.08] rounded-xl text-sm text-white/90 placeholder:text-white/20 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {isCraftingPrompt && (
                  <div className="absolute inset-0 rounded-xl bg-white/[0.02] backdrop-blur-[1px] flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <Wand2 className="h-3.5 w-3.5 text-primary animate-pulse" />
                      <span className="text-xs text-primary">Analyzing your dream...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress section */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">
                      Rendering cinematic sequence...
                    </p>
                    <span className="text-xs font-mono text-primary/60">{Math.round(progress)}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isCraftingPrompt}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium text-sm border-0 shadow-lg shadow-primary/20 transition-all duration-300 disabled:opacity-40"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Video</span>
                </div>
              )}
            </Button>

            {/* Subtle info */}
            {!isGenerating && (
              <p className="text-[10px] text-white/20 text-center">
                Powered by Veo 3.0 · ~1-2 min generation time
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
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
import { motion, AnimatePresence } from "framer-motion";

interface GenerateVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dreamTitle: string;
  dreamContent: string;
  onVideoGenerated?: (videoUrl: string) => void;
}

export function GenerateVideoDialog({ isOpen, onOpenChange, dreamTitle, dreamContent, onVideoGenerated }: GenerateVideoDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (dreamTitle && dreamContent && !prompt) {
      setPrompt(`A video of a dream titled "${dreamTitle}". The dream is: ${dreamContent.substring(0, 500)}...`);
    }
  }, [dreamTitle, dreamContent, prompt]);

  const generateVideo = async () => {
    setIsGenerating(true);
    let progressInterval: any;

    try {
      const response = await fetch('/api/generateVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 1000);

      setProgress(100);
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
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generate Dream Video</h2>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 py-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to generate a video of your dream..."
            className="resize-none"
          />
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setPrompt(`A video of a dream titled "${dreamTitle}". The dream is: ${dreamContent.substring(0, 500)}...`)}>
            <Wand2 className="mr-2 h-4 w-4" />
            Auto-Suggest
          </Button>
          <Button onClick={generateVideo} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Film className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, Brain, Leaf, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TherapyAnalysis {
  jungian: string;
  shamanic: string;
  cbt: string;
}

interface TherapyModeAnalysisProps {
  dream: DreamEntry;
}

const TherapyModeAnalysis = ({ dream }: TherapyModeAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analyses, setAnalyses] = useState<TherapyAnalysis | null>(null);
  const [favoriteMode, setFavoriteMode] = useState<string | null>(dream.favorite_therapy_mode || null);

  useEffect(() => {
    // Check if we already have analyses stored
    if (dream.jungian_analysis && dream.shamanic_analysis && dream.cbt_analysis) {
      setAnalyses({
        jungian: dream.jungian_analysis,
        shamanic: dream.shamanic_analysis,
        cbt: dream.cbt_analysis
      });
    } else {
      generateAnalyses();
    }
  }, [dream]);

  const generateAnalyses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dream-therapy', {
        body: { 
          dreamContent: dream.content,
          dreamTitle: dream.title 
        }
      });

      if (error) throw error;

      const newAnalyses = {
        jungian: data.jungian_analysis,
        shamanic: data.shamanic_analysis,
        cbt: data.cbt_analysis
      };

      setAnalyses(newAnalyses);

      // Save analyses to database
      const { error: updateError } = await supabase
        .from('dream_entries')
        .update({
          jungian_analysis: newAnalyses.jungian,
          shamanic_analysis: newAnalyses.shamanic,
          cbt_analysis: newAnalyses.cbt
        })
        .eq('id', dream.id);

      if (updateError) throw updateError;

      toast.success("Dream analysis complete!");
    } catch (error) {
      console.error("Error generating analyses:", error);
      toast.error("Failed to generate dream analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavoriteMode = async (mode: string) => {
    try {
      const { error } = await supabase
        .from('dream_entries')
        .update({ favorite_therapy_mode: mode })
        .eq('id', dream.id);

      if (error) throw error;

      setFavoriteMode(mode);
      toast.success("Favorite therapy mode saved!");
    } catch (error) {
      console.error("Error saving favorite mode:", error);
      toast.error("Failed to save favorite mode");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-dream-purple" />
        <h3 className="text-lg font-medium mb-2">Generating Analysis...</h3>
        <p className="text-muted-foreground">
          Our AI therapists are analyzing your dream from multiple perspectives
        </p>
      </Card>
    );
  }

  if (!analyses) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load analysis. Please try again.</p>
        <Button onClick={generateAnalyses} className="mt-4">
          Retry Analysis
        </Button>
      </Card>
    );
  }

  const therapyModes = [
    {
      id: 'jungian',
      title: 'From a Jungian Perspective',
      icon: Brain,
      analysis: analyses.jungian,
      description: 'Exploring archetypes, the collective unconscious, and symbolic meanings'
    },
    {
      id: 'shamanic',
      title: 'From a Shamanic Perspective',
      icon: Leaf,
      analysis: analyses.shamanic,
      description: 'Understanding spiritual messages, animal guides, and energy patterns'
    },
    {
      id: 'cbt',
      title: 'From a CBT Perspective',
      icon: Lightbulb,
      analysis: analyses.cbt,
      description: 'Examining thought patterns, behaviors, and practical insights'
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="jungian" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {therapyModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <TabsTrigger key={mode.id} value={mode.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {mode.id === 'jungian' ? 'Jungian' : 
                 mode.id === 'shamanic' ? 'Shamanic' : 'CBT'}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {therapyModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <TabsContent key={mode.id} value={mode.id}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="h-6 w-6 text-dream-purple" />
                  <div>
                    <h3 className="text-lg font-medium">{mode.title}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none mb-6">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {mode.analysis}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant={favoriteMode === mode.id ? "default" : "outline"}
                    onClick={() => saveFavoriteMode(mode.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`h-4 w-4 ${favoriteMode === mode.id ? 'fill-current' : ''}`} />
                    {favoriteMode === mode.id ? 'Saved as Favorite' : 'Save as Favorite'}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default TherapyModeAnalysis;

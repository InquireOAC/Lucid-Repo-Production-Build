
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { showSubscriptionPrompt } from "@/lib/stripe";

interface DreamAnalysisProps {
  dreamContent: string;
  existingAnalysis?: string;
  onAnalysisComplete: (analysis: string) => void;
  disabled?: boolean;
}

const DreamAnalysis = ({ 
  dreamContent, 
  existingAnalysis = "", 
  onAnalysisComplete,
  disabled = false
}: DreamAnalysisProps) => {
  const { user } = useAuth();
  const { hasUsedFeature, markFeatureAsUsed, canUseFeature } = useFeatureUsage();
  const [analysis, setAnalysis] = useState(existingAnalysis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(!existingAnalysis);

  const generateAnalysis = async () => {
    if (!user || disabled) return;
    
    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for analysis.");
      return;
    }

    try {
      // Special case for app creator - bypass the feature usage check
      const isAppCreator = user.email === "inquireoac@gmail.com";
      
      // Check if user can use the feature (free trial, subscription, or is app creator)
      const canUse = isAppCreator || await canUseFeature('analysis');
      
      if (!canUse) {
        // User has used their free trial and doesn't have a subscription
        showSubscriptionPrompt('analysis');
        return;
      }
      
      setIsGenerating(true);
      setShowInfo(false);

      // Call directly to the analyze-dream function
      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { 
          dreamContent,
          task: 'analyze_dream'
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Failed to generate analysis');
      }
      
      if (data?.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete(data.analysis);
        
        // If this was a free trial use and not the app creator, mark the feature as used
        if (!isAppCreator && !hasUsedFeature('analysis')) {
          markFeatureAsUsed('analysis');
          toast.success("Free trial used! Subscribe to continue analyzing dreams.", {
            duration: 5000,
            action: {
              label: "Subscribe",
              onClick: () => window.location.href = '/profile?tab=subscription'
            }
          });
        } else {
          toast.success("Dream analysis complete!");
        }
      } else {
        throw new Error('No analysis data returned');
      }
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`);
      console.error('Analysis error details:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showInfo && !analysis && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Sparkles className="h-5 w-5 mr-2 text-dream-purple" />
            Dream Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {disabled 
                ? "Only the dream owner can analyze this dream."
                : hasUsedFeature('analysis') && user?.email !== "inquireoac@gmail.com"
                  ? "You've used your free analysis. Subscribe to analyze more dreams."
                  : "Generate an AI-powered analysis of your dream's symbolism and meaning. (Free trial available)"
              }
            </p>
            {!disabled && (
              <Button
                onClick={generateAnalysis}
                className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
              >
                <Sparkles className="h-4 w-4 mr-2" /> 
                {hasUsedFeature('analysis') && user?.email !== "inquireoac@gmail.com" ? "Subscribe to Analyze" : "Analyze Dream"}
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
          <Sparkles className="h-5 w-5 mr-2 text-dream-purple" />
          Dream Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
            <p className="mt-2 text-sm text-muted-foreground">
              Analyzing your dream...
            </p>
          </div>
        ) : (
          <>
            <Textarea
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              className="min-h-[120px] mb-3"
              placeholder="Dream analysis will appear here..."
              disabled={disabled}
            />
            {!disabled && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAnalysis}
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

export default DreamAnalysis;

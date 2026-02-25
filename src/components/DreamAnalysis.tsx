
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Lock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { showSubscriptionPrompt } from "@/lib/stripe";
import { AnalysisSections } from "@/components/dreams/AnalysisSections";

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
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionContext();
  const { hasUsedFeature, recordFeatureUsage } = useFeatureUsage();
  const [analysis, setAnalysis] = useState(existingAnalysis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(!existingAnalysis);

  const isAppCreator = user?.email === "inquireoac@gmail.com";
  const hasUsedFreeTrial = hasUsedFeature('analysis');
  const hasActiveSubscription = subscription?.status === 'active';
  const isFeatureEnabled = isAppCreator || !hasUsedFreeTrial || hasActiveSubscription;

  const generateAnalysis = async () => {
    if (!user || disabled) return;

    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for analysis.");
      return;
    }

    if (!isFeatureEnabled) {
      showSubscriptionPrompt('analysis');
      return;
    }

    try {
      setIsGenerating(true);
      setShowInfo(false);

      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { dreamContent, task: 'analyze_dream' }
      });

      if (error) throw new Error(error.message || 'Failed to generate analysis');

      if (data?.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete(data.analysis);

        const usageRecorded = await recordFeatureUsage('analysis');
        console.log('Analysis usage recorded:', usageRecorded);

        if (!isAppCreator && !hasUsedFreeTrial && !hasActiveSubscription) {
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
      console.error('Analysis generation failed:', error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (subscriptionLoading && !subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Brain className="h-5 w-5 mr-2 text-dream-purple" />
            Dream Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-2">
            Checking subscription status...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showInfo && !analysis && !isGenerating) {
    return (
      <Card>
        <CardContent>
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {disabled
                ? "Only the dream owner can analyze this dream."
                : !isFeatureEnabled
                ? "You've used your free analysis. Subscribe to analyze more dreams."
                : "Get a professional multi-layered interpretation of your dream — symbols, emotions, subconscious messages, and a personal reflection invitation."}
            </p>
            {!disabled && isFeatureEnabled && (
              <Button
                onClick={generateAnalysis}
                className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90 text-white"
              >
                
                Analyze Dream
              </Button>
            )}
            {!disabled && !isFeatureEnabled && (
              <Button
                onClick={() => showSubscriptionPrompt('analysis')}
                variant="outline"
                className="border-dream-purple text-dream-purple hover:bg-dream-purple hover:text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                Subscribe to Analyze
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Brain className="h-5 w-5 mr-2 text-dream-purple" />
            Dream Analysis
          </CardTitle>
          {!disabled && isFeatureEnabled && !isGenerating && analysis && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateAnalysis}
              disabled={isGenerating}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="relative">
              <Brain className="h-10 w-10 text-dream-purple opacity-20" />
              <Loader2 className="h-10 w-10 animate-spin text-dream-purple absolute inset-0" />
            </div>
            <p className="text-sm text-muted-foreground">
              Exploring the depths of your dream…
            </p>
          </div>
        ) : analysis ? (
          <AnalysisSections text={analysis} />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DreamAnalysis;

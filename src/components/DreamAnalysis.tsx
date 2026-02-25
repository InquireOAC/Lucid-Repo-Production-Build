
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, RefreshCw, Sparkles } from "lucide-react";
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
      <div className="glass-card rounded-2xl p-6 border border-primary/10">
        <p className="text-sm text-muted-foreground text-center py-2">
          Checking subscription status...
        </p>
      </div>
    );
  }

  if (showInfo && !analysis && !isGenerating) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-primary/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative text-center space-y-4 py-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {disabled
              ? "Only the dream owner can analyze this dream."
              : !isFeatureEnabled
              ? "You've used your free analysis. Subscribe to analyze more dreams."
              : "Unlock deeper meaning — symbols, emotions, and subconscious messages interpreted by AI."}
          </p>
          {!disabled && isFeatureEnabled && (
            <Button
              onClick={generateAnalysis}
              variant="aurora"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Dream
            </Button>
          )}
          {!disabled && !isFeatureEnabled && (
            <Button
              onClick={() => showSubscriptionPrompt('analysis')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Lock className="h-4 w-4 mr-2" />
              Subscribe to Analyze
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
      {/* Header with regenerate */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Dream Analysis</span>
        </div>
        {!disabled && isFeatureEnabled && !isGenerating && analysis && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateAnalysis}
            disabled={isGenerating}
            className="text-muted-foreground hover:text-foreground h-8 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Regenerate
          </Button>
        )}
      </div>

      <div className="px-6 pb-6">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-primary opacity-20" />
              <Loader2 className="h-10 w-10 animate-spin text-primary absolute inset-0" />
            </div>
            <p className="text-sm text-muted-foreground">
              Exploring the depths of your dream…
            </p>
          </div>
        ) : analysis ? (
          <AnalysisSections text={analysis} />
        ) : null}
      </div>
    </div>
  );
};

export default DreamAnalysis;

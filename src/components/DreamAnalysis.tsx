
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Brain, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
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
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionContext();
  const { hasUsedFeature, recordFeatureUsage } = useFeatureUsage();
  const [analysis, setAnalysis] = useState(existingAnalysis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(!existingAnalysis);

  const isAppCreator = user?.email === "inquireoac@gmail.com";
  const hasUsedFreeTrial = hasUsedFeature('analysis');

  // Check if user has active subscription from subscription context
  const hasActiveSubscription = subscription?.status === 'active';

  // Determine if feature is enabled based on subscription status
  // User can use feature if: they're app creator, haven't used free trial yet, or have active subscription
  const isFeatureEnabled = isAppCreator || !hasUsedFreeTrial || hasActiveSubscription;

  console.log('DreamAnalysis - Feature check:', {
    disabled,
    hasUsedFreeTrial,
    isAppCreator,
    hasActiveSubscription,
    subscriptionStatus: subscription?.status,
    isFeatureEnabled,
    subscriptionLoading
  });

  const generateAnalysis = async () => {
    if (!user || disabled) return;

    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for analysis.");
      return;
    }

    // Check if user can use the feature before proceeding
    if (!isFeatureEnabled) {
      console.log('User cannot use analysis feature - showing subscription prompt');
      showSubscriptionPrompt('analysis');
      return;
    }

    try {
      console.log('Starting dream analysis generation...');

      setIsGenerating(true);
      setShowInfo(false);

      console.log('Calling analyze-dream function...');

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
        console.log('Analysis generated successfully');
        setAnalysis(data.analysis);
        onAnalysisComplete(data.analysis);

        // Record the feature usage only after successful generation
        const usageRecorded = await recordFeatureUsage('analysis');
        console.log('Analysis usage recorded:', usageRecorded);

        // Show appropriate success message
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

  // Show loading state while subscription is being checked
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
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Checking subscription status...
            </p>
          </div>
        </CardContent>
      </Card>);

  }

  if (showInfo && !analysis && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          




        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {disabled ?
              "Only the dream owner can analyze this dream." :
              !isFeatureEnabled ?
              "You've used your free analysis. Subscribe to analyze more dreams." :
              "Generate an AI-powered analysis of your dream's symbolism and meaning. (Free trial available)"
              }
            </p>
            {!disabled && isFeatureEnabled &&
            <Button
              onClick={generateAnalysis}
              className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90 bg-violet-800 hover:bg-violet-700 text-white">

                 
                Analyze Dream
              </Button>
            }
            {!disabled && !isFeatureEnabled &&
            <Button
              onClick={() => showSubscriptionPrompt('analysis')}
              variant="outline"
              className="border-dream-purple text-dream-purple hover:bg-dream-purple hover:text-white">

                <Lock className="h-4 w-4 mr-2" /> 
                Subscribe to Analyze
              </Button>
            }
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Brain className="h-5 w-5 mr-2 text-dream-purple" />
          Dream Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ?
        <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
            <p className="mt-2 text-sm text-muted-foreground">
              Analyzing your dream...
            </p>
          </div> :

        <>
            <Textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            className="min-h-[120px] mb-3"
            placeholder="Dream analysis will appear here..."
            disabled={disabled} />

            {!disabled && isFeatureEnabled &&
          <div className="flex justify-end">
                <Button
              variant="outline"
              size="sm"
              onClick={generateAnalysis}
              disabled={isGenerating}>

                  <Brain className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              </div>
          }
          </>
        }
      </CardContent>
    </Card>);

};

export default DreamAnalysis;
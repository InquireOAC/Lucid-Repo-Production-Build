
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
      // Check if user can use the feature (free trial or subscription)
      const canUse = await canUseFeature('analysis');
      
      if (!canUse) {
        // User has used their free trial and doesn't have a subscription
        showSubscriptionPrompt('analysis');
        return;
      }
      
      setIsGenerating(true);
      setShowInfo(false);

      const { data: customerData } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Set up request body with or without customer ID (for tracking subscription usage)
      const requestBody: any = {
        dream_content: dreamContent
      };
      
      // Add customer_id only if it exists (user has a subscription)
      if (customerData?.customer_id) {
        requestBody.customer_id = customerData.customer_id;
      }

      const response = await fetch('/api/analyze-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();
      
      if (result.analysis) {
        setAnalysis(result.analysis);
        onAnalysisComplete(result.analysis);
        
        // If this was a free trial use, mark the feature as used
        if (!hasUsedFeature('analysis')) {
          markFeatureAsUsed('analysis');
          toast.success("Free trial used! Subscribe to continue analyzing dreams.", {
            duration: 5000,
            action: {
              label: "Subscribe",
              onClick: () => window.location.href = '/profile?tab=subscription'
            }
          });
        }
      }
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`);
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
                : hasUsedFeature('analysis') 
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
                {hasUsedFeature('analysis') ? "Subscribe to Analyze" : "Analyze Dream"}
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

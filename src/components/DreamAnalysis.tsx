
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [analysis, setAnalysis] = useState(existingAnalysis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(!existingAnalysis);

  const generateAnalysis = async () => {
    if (!user || disabled) return;
    
    if (dreamContent.trim().length < 20) {
      toast.error("Dream description is too short for analysis.");
      return;
    }

    // Check if user has subscription credits for analysis
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .single();

      if (customerError) {
        if (customerError.code !== 'PGRST116') { // Not found error
          toast.error("Error checking subscription: " + customerError.message);
          return;
        }
        // If no customer record, treat as no subscription
        toast.error("You need a subscription to analyze dreams. Please subscribe in your profile.");
        return;
      }

      if (customerData) {
        // Check if user has analysis credits
        const { data: canAnalyze, error: creditError } = await supabase
          .rpc('check_subscription_credits', { 
            customer_id: customerData.customer_id,
            credit_type: 'analysis'
          });

        if (creditError) {
          toast.error("Error checking analysis credits: " + creditError.message);
          return;
        }

        if (!canAnalyze) {
          toast.error("You've used all your dream analysis credits for this billing period.");
          return;
        }

        // If we get here, user has credits, proceed with analysis
        setIsGenerating(true);
        setShowInfo(false);

        try {
          const response = await fetch('/api/analyze-dream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dream_content: dreamContent,
              customer_id: customerData.customer_id
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }

          const result = await response.json();
          
          if (result.analysis) {
            setAnalysis(result.analysis);
            onAnalysisComplete(result.analysis);
          }
        } catch (error: any) {
          toast.error(`Analysis failed: ${error.message}`);
        } finally {
          setIsGenerating(false);
        }
      } else {
        toast.error("You need a subscription to analyze dreams. Please subscribe in your profile.");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
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
                : "Generate an AI-powered analysis of your dream's symbolism and meaning."
              }
            </p>
            {!disabled && (
              <Button
                onClick={generateAnalysis}
                className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Analyze Dream
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

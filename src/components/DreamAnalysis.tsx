import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Import the new subscription checking functions
import { checkFeatureAccess, incrementFeatureUsage, showSubscriptionPrompt } from "@/lib/stripe";

interface DreamAnalysisProps {
  dreamContent: string;
  existingAnalysis?: string;
  onAnalysisComplete?: (analysis: string) => void;
}

const DreamAnalysis = ({
  dreamContent,
  existingAnalysis,
  onAnalysisComplete,
}: DreamAnalysisProps) => {
  const [dreamAnalysis, setDreamAnalysis] = useState(existingAnalysis || "");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (analyzing) return;
    
    try {
      setAnalyzing(true);
      
      // Check if the user has access to this feature
      const hasAccess = await checkFeatureAccess('analysis');
      if (!hasAccess) {
        showSubscriptionPrompt('analysis');
        return;
      }
      
      // Proceed with analysis
      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { 
          dreamContent,
          task: 'analyze'
        }
      });

      if (error) throw error;
      
      // Increment usage counter after successful analysis
      await incrementFeatureUsage('analysis');
      
      const analysis = data.analysis;
      setDreamAnalysis(analysis);
      onAnalysisComplete?.(analysis);
      toast.success("Dream analysis completed!");
    } catch (error) {
      console.error("Error analyzing dream:", error);
      toast.error("Failed to analyze dream. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Brain size={18} />
          Dream Interpretation
        </h3>
      </div>

      <Separator />

      <div className="space-y-4">
        <Textarea
          placeholder="Your dream analysis will appear here..."
          value={dreamAnalysis}
          readOnly
          className="h-32 resize-none"
        />
        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
        >
          {analyzing ? "Analyzing..." : "Analyze Dream"}
        </Button>
      </div>
    </div>
  );
};

export default DreamAnalysis;

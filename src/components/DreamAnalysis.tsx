import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DreamAnalysisProps {
  dreamContent: string;
  existingAnalysis?: string;
  onAnalysisComplete: (analysis: string) => void;
}

const DreamAnalysis = ({
  dreamContent,
  existingAnalysis,
  onAnalysisComplete,
}: DreamAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | undefined>(existingAnalysis);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { dreamContent }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      onAnalysisComplete(data.analysis);
      toast.success("Dream analysis complete!");
    } catch (error) {
      console.error("Error analyzing dream:", error);
      toast.error("Failed to analyze dream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Book size={18} />
          Dream Analysis
        </h3>
        {!analysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={loading}
            className="border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
          >
            {loading ? "Analyzing..." : "Analyze Dream"}
          </Button>
        )}
      </div>

      <Separator />

      {analysis ? (
        <Card className="bg-dream-purple/5 border-dream-lavender/20">
          <CardContent className="p-4 text-sm">
            {analysis.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Click "Analyze Dream" to get AI-powered insights into your dream's potential meanings.
        </p>
      )}
    </div>
  );
};

export default DreamAnalysis;

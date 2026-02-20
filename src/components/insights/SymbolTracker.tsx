import React from "react";
import { useSymbolAnalysis } from "@/hooks/useSymbolAnalysis";
import SymbolCategory from "./SymbolCategory";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const SymbolTracker: React.FC = () => {
  const { user } = useAuth();
  const { analysis, dreamCount, isLoading, isAnalyzing, lastAnalyzedAt, runAnalysis } = useSymbolAnalysis();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <Sparkles className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sign in to see your dream symbols</h3>
        <p className="text-muted-foreground text-sm">Your recurring symbols, themes, and patterns will appear here.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Dream Symbols</h2>
          {lastAnalyzedAt && (
            <p className="text-xs text-muted-foreground">
              {dreamCount} dreams analyzed • {formatDistanceToNow(new Date(lastAnalyzedAt), { addSuffix: true })}
            </p>
          )}
        </div>
        <Button
          variant="aurora"
          size="sm"
          onClick={runAnalysis}
          disabled={isAnalyzing}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Analyzing..." : analysis ? "Re-analyze" : "Analyze Dreams"}
        </Button>
      </div>

      {!analysis ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-10 h-10 text-primary mb-3" />
          <h3 className="font-semibold mb-1">No analysis yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Tap "Analyze Dreams" to discover recurring symbols, themes, and patterns across all your dream entries.
          </p>
        </div>
      ) : (
        <>
          <SymbolCategory title="People & Characters" icon="👤" items={analysis.people} />
          <SymbolCategory title="Places" icon="🏔️" items={analysis.places} />
          <SymbolCategory title="Objects" icon="🔑" items={analysis.objects} />
          <SymbolCategory title="Themes" icon="🌀" items={analysis.themes} />
          <SymbolCategory title="Emotions" icon="💜" items={analysis.emotions} />
        </>
      )}
    </div>
  );
};

export default SymbolTracker;

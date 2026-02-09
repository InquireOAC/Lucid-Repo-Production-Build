import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, TrendingUp } from "lucide-react";
import { useDreams } from "@/hooks/useDreams";

interface DreamSignDetectorProps {
  onComplete: () => void;
}

export const DreamSignDetector: React.FC<DreamSignDetectorProps> = ({ onComplete }) => {
  const { dreams: entries } = useDreams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeDreams = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Analyze dream entries for patterns
    const allTags = entries.flatMap((entry) => entry.tags || []);
    const tagCounts: Record<string, number> = {};
    
    allTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Find common words in content
    const allContent = entries.map((e) => e.content.toLowerCase()).join(" ");
    const words = allContent.split(/\s+/);
    const wordCounts: Record<string, number> = {};
    
    const commonWords = new Set([
      "water", "ocean", "swimming", "flying", "falling", "running", "chasing",
      "house", "home", "school", "work", "car", "driving", "family", "friend",
      "late", "lost", "test", "exam", "teeth", "naked", "monster", "animal"
    ]);

    words.forEach((word) => {
      if (commonWords.has(word) && word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    const topSigns = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sign, count]) => ({
        sign,
        count,
        percentage: Math.round((count / entries.length) * 100),
      }));

    setResults({
      totalDreams: entries.length,
      topSigns,
      analysis: entries.length >= 20 ? "Great! You have enough dreams for accurate pattern detection." : "Keep journaling! 20+ dreams give better pattern detection.",
    });

    setIsAnalyzing(false);
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          AI Dream Sign Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm">
            🔍 <strong>What are dream signs?</strong> Recurring elements in your dreams that can trigger lucidity when you recognize them.
          </p>
        </div>

        {!results && (
          <>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                We'll analyze your last {entries.length} dream{entries.length !== 1 ? "s" : ""} to identify recurring patterns and elements.
              </p>
              {entries.length < 5 && (
                <p className="text-sm text-yellow-500 mb-4">
                  ⚠️ You need at least 5 dreams for meaningful analysis. Keep journaling!
                </p>
              )}
            </div>

            <Button
              onClick={analyzeDreams}
              disabled={isAnalyzing || entries.length < 5}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing Dreams...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </>
        )}

        {isAnalyzing && (
          <div className="space-y-3">
            <Progress value={66} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Scanning for patterns and recurring elements...
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400">
                ✓ Analysis complete! Found patterns in {results.totalDreams} dreams.
              </p>
              <p className="text-xs text-muted-foreground mt-1">{results.analysis}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Top Dream Signs:
              </h3>
              <div className="space-y-3">
                {results.topSigns.map((item: any, index: number) => (
                  <div key={index} className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold capitalize">{item.sign}</span>
                      <Badge variant="secondary">
                        {item.count}x ({item.percentage}%)
                      </Badge>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Appears in {item.percentage}% of your dreams
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm">
                💡 <strong>Next step:</strong> Do a reality check whenever you encounter these elements in waking life. Your brain will learn to do the same in dreams!
              </p>
            </div>

            <Button onClick={onComplete} className="w-full">
              Save Results & Complete +15 XP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

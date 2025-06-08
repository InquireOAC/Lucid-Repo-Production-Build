
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Sparkles, Tag } from "lucide-react";
import TherapyModeAnalysis from "@/components/therapy/TherapyModeAnalysis";
import { formatDistanceToNow } from "date-fns";

const TherapyAnalysis = () => {
  const { dreamId } = useParams<{ dreamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries } = useDreamJournal();
  const [showAnalysis, setShowAnalysis] = useState(false);

  const dream = entries.find(d => d.id === dreamId);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!dream) {
      navigate("/therapy");
      return;
    }
  }, [user, dream, navigate]);

  if (!dream) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/therapy")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Therapy Mode
        </Button>
      </div>

      {!showAnalysis ? (
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">{dream.title}</h1>
          
          <div className="text-sm text-muted-foreground mb-4">
            {formatDistanceToNow(new Date(dream.date), { addSuffix: true })}
            {dream.mood && <span className="ml-4">Mood: {dream.mood}</span>}
            {dream.lucid && <span className="ml-4">• Lucid Dream</span>}
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {dream.content}
            </p>
          </div>

          {dream.tags && dream.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {dream.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-dream-purple/10 text-dream-purple rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Brain className="h-8 w-8 text-dream-purple" />
                <Sparkles className="h-6 w-6 text-dream-purple" />
              </div>
              <h3 className="text-lg font-medium mb-2">AI Dream Therapy Analysis</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get professional interpretations of your dream from three different therapeutic perspectives:
                Jungian analysis, shamanic wisdom, and cognitive behavioral therapy.
              </p>
              <Button 
                onClick={() => setShowAnalysis(true)}
                size="lg"
                className="min-w-[200px]"
              >
                Start Therapy Analysis
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <TherapyModeAnalysis dream={dream} />
      )}
    </div>
  );
};

export default TherapyAnalysis;

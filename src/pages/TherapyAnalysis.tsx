
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Sparkles } from "lucide-react";
import TherapyModeAnalysis from "@/components/therapy/TherapyModeAnalysis";

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
        
        <h1 className="text-2xl font-bold mb-2">{dream.title}</h1>
        <p className="text-muted-foreground">
          Ready to explore your dream through different therapeutic perspectives?
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Your Dream</h2>
        <p className="text-muted-foreground leading-relaxed">
          {dream.content}
        </p>
      </Card>

      {!showAnalysis ? (
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-12 w-12 text-dream-purple" />
            <Sparkles className="h-8 w-8 text-dream-purple" />
          </div>
          <h3 className="text-xl font-medium mb-4">AI Dream Therapy Analysis</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get professional interpretations of your dream from three different therapeutic perspectives:
            Jungian analysis, shamanic wisdom, and cognitive behavioral therapy.
          </p>
          <Button 
            onClick={() => setShowAnalysis(true)}
            size="lg"
            className="min-w-[200px]"
          >
            Start Therapy Mode
          </Button>
        </Card>
      ) : (
        <TherapyModeAnalysis dream={dream} />
      )}
    </div>
  );
};

export default TherapyAnalysis;

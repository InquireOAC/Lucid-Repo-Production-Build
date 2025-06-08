
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import TherapyDreamList from "@/components/therapy/TherapyDreamList";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";

const TherapyMode = () => {
  const { user } = useAuth();
  const { entries } = useDreamJournal();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to access AI Dream Therapy Mode</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-dream-purple" />
          <Sparkles className="h-6 w-6 text-dream-purple" />
        </div>
        <h1 className="text-3xl font-bold mb-2">AI Dream Therapy Mode</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore your dreams through different psychological perspectives. 
          Get insights from Jungian analysis, shamanic wisdom, and cognitive behavioral therapy.
        </p>
      </div>

      <TherapyDreamList dreams={entries} />
    </div>
  );
};

export default TherapyMode;

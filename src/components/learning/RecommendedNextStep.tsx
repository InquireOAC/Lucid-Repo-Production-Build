import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface RecommendedNextStepProps {
  pathTitle: string;
  levelTitle: string;
  onClick: () => void;
}

export const RecommendedNextStep: React.FC<RecommendedNextStepProps> = ({
  pathTitle,
  levelTitle,
  onClick,
}) => {
  return (
    <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Recommended Next Step</h3>
            <p className="text-muted-foreground mb-3">
              Continue {pathTitle}: {levelTitle}
            </p>
            <Button onClick={onClick} className="bg-primary hover:bg-primary/90">
              Start Practice →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface Technique {
  name: string;
  acronym?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
  description: string;
  steps: string[];
}

const difficultyVariant = {
  Beginner: "aurora" as const,
  Intermediate: "gold" as const,
  Advanced: "lucid" as const,
};

const TechniqueCard: React.FC<{ technique: Technique }> = ({ technique }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card
      variant="glass"
      className="cursor-pointer transition-all hover:border-primary/30"
      onClick={() => setOpen(!open)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{technique.icon}</span>
            <div>
              <CardTitle className="text-base leading-tight">
                {technique.name}
                {technique.acronym && (
                  <span className="text-primary ml-1.5 text-sm font-normal">({technique.acronym})</span>
                )}
              </CardTitle>
              <Badge variant={difficultyVariant[technique.difficulty]} className="mt-1 text-[10px]">
                {technique.difficulty}
              </Badge>
            </div>
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{technique.description}</p>
        {open && (
          <ol className="mt-3 space-y-2 list-decimal list-inside text-sm text-foreground/80">
            {technique.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default TechniqueCard;

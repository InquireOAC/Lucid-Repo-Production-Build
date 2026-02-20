import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SymbolItem } from "@/hooks/useSymbolAnalysis";

interface SymbolCategoryProps {
  title: string;
  icon: string;
  items: SymbolItem[];
}

const SymbolCategory: React.FC<SymbolCategoryProps> = ({ title, icon, items }) => {
  if (!items || items.length === 0) return null;

  const maxCount = items[0]?.count || 1;

  return (
    <Card variant="glass" className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
          <span className="text-xs text-muted-foreground ml-auto">{items.length} found</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => {
          const pct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{item.name}</span>
                <span className="text-muted-foreground text-xs">
                  {item.count} dream{item.count !== 1 ? "s" : ""}
                </span>
              </div>
              <Progress value={pct} className="h-2 bg-muted/30" />
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SymbolCategory;

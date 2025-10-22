import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  xp: number;
}

interface DailyPracticeChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
}

export const DailyPracticeChecklist: React.FC<DailyPracticeChecklistProps> = ({
  items,
  onToggle,
}) => {
  const completedCount = items.filter((item) => item.completed).length;

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>✅ Today's Practice</span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Checkbox
              id={item.id}
              checked={item.completed}
              onCheckedChange={() => onToggle(item.id)}
            />
            <label
              htmlFor={item.id}
              className={`flex-1 cursor-pointer ${
                item.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.label}
            </label>
            <span className="text-xs text-primary font-semibold">+{item.xp} XP</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

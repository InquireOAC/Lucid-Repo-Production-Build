import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
}) => {
  return (
    <Card className="glass-card border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
            {currentStreak > 0 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {currentStreak}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {currentStreak}-Day Streak!
            </h3>
            <p className="text-sm text-muted-foreground">
              Longest: {longestStreak} days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

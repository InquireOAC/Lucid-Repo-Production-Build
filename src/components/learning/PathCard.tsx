import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock } from "lucide-react";
import { LearningPath } from "@/hooks/useLearningPaths";
import { PathProgress } from "@/hooks/usePathProgress";

interface PathCardProps {
  path: LearningPath;
  progress?: PathProgress;
  onClick: () => void;
}

export const PathCard: React.FC<PathCardProps> = ({ path, progress, onClick }) => {
  const isLocked = progress && !progress.is_unlocked;
  const progressPercent = progress ? (progress.xp_earned / (progress.current_level * 100)) * 100 : 0;

  return (
    <Card 
      className={`glass-card border-white/10 hover:border-primary/50 transition-all cursor-pointer ${
        isLocked ? "opacity-60" : ""
      }`}
      onClick={isLocked ? undefined : onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-4xl">{path.icon}</div>
          {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>
        <CardTitle className="gradient-text">{path.title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {path.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {progress && !isLocked ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Level {progress.current_level}</span>
              <span className="text-primary font-semibold">{progress.xp_earned} XP</span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progressPercent)}% complete
            </p>
          </>
        ) : isLocked ? (
          <p className="text-sm text-muted-foreground">
            🔒 Complete prerequisites to unlock
          </p>
        ) : (
          <button className="w-full py-2 px-4 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm font-medium transition-colors">
            Start Path →
          </button>
        )}
      </CardContent>
    </Card>
  );
};

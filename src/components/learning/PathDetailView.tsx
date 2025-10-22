import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle, Circle, ArrowLeft } from "lucide-react";
import { LearningPath } from "@/hooks/useLearningPaths";
import { PathLevel } from "@/hooks/usePathLevels";
import { PathProgress } from "@/hooks/usePathProgress";

interface PathDetailViewProps {
  path: LearningPath;
  levels: PathLevel[];
  progress?: PathProgress;
  onLevelClick: (level: PathLevel) => void;
  onBack: () => void;
}

export const PathDetailView: React.FC<PathDetailViewProps> = ({
  path,
  levels,
  progress,
  onLevelClick,
  onBack,
}) => {
  const currentLevel = progress?.current_level || 1;
  const totalLevels = levels.length;
  const progressPercent = (currentLevel / totalLevels) * 100;

  const getLevelStatus = (level: PathLevel) => {
    if (level.level_number < currentLevel) return "completed";
    if (level.level_number === currentLevel) return "current";
    return "locked";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>{path.icon}</span>
            <span className="gradient-text">{path.title}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{path.description}</p>
        </div>
      </div>

      <Card className="glass-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Level {currentLevel} of {totalLevels}
            </span>
            <span className="text-primary font-semibold">
              {progress?.xp_earned || 0} XP
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {levels.map((level) => {
          const status = getLevelStatus(level);
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isCurrent = status === "current";

          return (
            <Card
              key={level.id}
              className={`glass-card border-white/10 transition-all ${
                isLocked ? "opacity-60" : "hover:border-primary/50 cursor-pointer"
              } ${isCurrent ? "border-primary/50 bg-primary/5" : ""}`}
              onClick={isLocked ? undefined : () => onLevelClick(level)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {isCurrent && <Circle className="w-6 h-6 text-primary animate-pulse" />}
                    {isLocked && <Lock className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      Level {level.level_number}: {level.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {level.description}
                    </CardDescription>
                    {!isLocked && (
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">📹 Videos:</span>{" "}
                          <span className="font-semibold">{level.content.videos?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">📝 Readings:</span>{" "}
                          <span className="font-semibold">{level.content.readings?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">⏱️ Exercises:</span>{" "}
                          <span className="font-semibold">{level.content.exercises?.length || 0}</span>
                        </div>
                      </div>
                    )}
                    {isLocked && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        🔒 Requires {level.xp_required} XP to unlock
                      </p>
                    )}
                    {isCurrent && (
                      <Button className="mt-4" onClick={() => onLevelClick(level)}>
                        Continue Learning →
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

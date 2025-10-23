import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, PlayCircle, BookOpen, Dumbbell, Award } from "lucide-react";
import { PathLevel } from "@/hooks/usePathLevels";
import { useLessonTracking } from "@/hooks/useLessonTracking";
import { usePracticeLog } from "@/hooks/usePracticeLog";
import { JournalSetupWizard } from "./exercises/JournalSetupWizard";
import { TimedWriteSession } from "./exercises/TimedWriteSession";
import { SleepCycleCalculator } from "./exercises/SleepCycleCalculator";
import { DreamSignDetector } from "./exercises/DreamSignDetector";

interface LevelContentViewProps {
  level: PathLevel;
  pathId: string;
  onBack: () => void;
}

export const LevelContentView: React.FC<LevelContentViewProps> = ({
  level,
  pathId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isLessonComplete, markLessonComplete } = useLessonTracking(level.id);
  const { logPractice } = usePracticeLog();

  const handleVideoComplete = async (videoId: string) => {
    await markLessonComplete.mutateAsync({
      levelId: level.id,
      lessonType: "video",
      lessonId: videoId,
    });

    // Log practice and award XP
    await logPractice.mutateAsync({
      practiceTypeId: "video_lesson", // We'll need to get actual ID
      pathId,
      levelId: level.id,
      xpEarned: 8,
    });
  };

  const handleReadingComplete = async (readingId: string) => {
    await markLessonComplete.mutateAsync({
      levelId: level.id,
      lessonType: "reading",
      lessonId: readingId,
    });

    await logPractice.mutateAsync({
      practiceTypeId: "reading_material",
      pathId,
      levelId: level.id,
      xpEarned: 8,
    });
  };

  const handleExerciseComplete = async (exerciseId: string) => {
    await markLessonComplete.mutateAsync({
      levelId: level.id,
      lessonType: "exercise",
      lessonId: exerciseId,
    });

    await logPractice.mutateAsync({
      practiceTypeId: "practice_exercise",
      pathId,
      levelId: level.id,
      xpEarned: 10,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text">
            Level {level.level_number}: {level.title}
          </h1>
          <p className="text-muted-foreground mt-1">{level.description}</p>
        </div>
      </div>

      {level.content.achievement && (
        <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10">
          <CardContent className="pt-6 flex items-center gap-4">
            <Award className="w-10 h-10 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">
                {level.content.achievement.emoji} {level.content.achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete this level to earn +{level.content.achievement.xp} XP
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>📋 Level Overview</CardTitle>
          <CardDescription>{level.content.overview}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">
            Videos ({level.content.videos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="readings">
            Readings ({level.content.readings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="exercises">
            Exercises ({level.content.exercises?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Practice Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {level.content.practices?.map((practice) => (
                <div
                  key={practice.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span>{practice.title}</span>
                  <Badge variant="secondary">+{practice.xp} XP</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4 mt-6">
          {level.content.videos?.map((video) => {
            const completed = isLessonComplete(video.id);
            return (
              <Card key={video.id} className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <PlayCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Duration: {video.duration}
                        </CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      checked={completed}
                      onCheckedChange={() => !completed && handleVideoComplete(video.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="outline" className="glass-button">
                      Watch Video →
                    </Button>
                  </a>
                  {completed && (
                    <Badge variant="secondary" className="ml-3">
                      ✓ Completed - 8 XP earned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="readings" className="space-y-4 mt-6">
          {level.content.readings?.map((reading) => {
            const completed = isLessonComplete(reading.id);
            return (
              <Card key={reading.id} className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <CardTitle className="text-lg">{reading.title}</CardTitle>
                    </div>
                    <Checkbox
                      checked={completed}
                      onCheckedChange={() => !completed && handleReadingComplete(reading.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {reading.content}
                  </p>
                  {completed && (
                    <Badge variant="secondary" className="mt-4">
                      ✓ Completed - 8 XP earned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4 mt-6">
          {level.content.exercises?.map((exercise) => {
            const completed = isLessonComplete(exercise.id);
            
            // Render interactive exercises
            if (exercise.id === "setup_wizard") {
              return (
                <JournalSetupWizard
                  key={exercise.id}
                  onComplete={() => handleExerciseComplete(exercise.id)}
                />
              );
            }
            
            if (exercise.id === "timed_write") {
              return (
                <TimedWriteSession
                  key={exercise.id}
                  duration={exercise.duration || 5}
                  onComplete={() => handleExerciseComplete(exercise.id)}
                />
              );
            }
            
            if (exercise.id === "sleep_calculator") {
              return (
                <SleepCycleCalculator
                  key={exercise.id}
                  onComplete={() => handleExerciseComplete(exercise.id)}
                />
              );
            }
            
            if (exercise.id === "ai_detector") {
              return (
                <DreamSignDetector
                  key={exercise.id}
                  onComplete={() => handleExerciseComplete(exercise.id)}
                />
              );
            }
            
            // Default exercise card
            return (
              <Card key={exercise.id} className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Dumbbell className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">{exercise.title}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {exercise.type}
                        </Badge>
                        {exercise.duration && (
                          <Badge variant="outline" className="ml-2">
                            {exercise.duration} min
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Checkbox
                      checked={completed}
                      onCheckedChange={() => !completed && handleExerciseComplete(exercise.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{exercise.description}</p>
                  <Button
                    onClick={() => !completed && handleExerciseComplete(exercise.id)}
                    disabled={completed}
                  >
                    {completed ? "✓ Completed" : "Start Exercise →"}
                  </Button>
                  {completed && (
                    <Badge variant="secondary" className="ml-3">
                      10 XP earned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

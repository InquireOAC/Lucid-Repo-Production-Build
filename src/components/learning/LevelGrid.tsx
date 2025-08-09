import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Play } from 'lucide-react';
import { LevelDetail } from './LevelDetail';
import { useLearningLevels } from '@/hooks/useLearningLevels';
import { useState } from 'react';

interface LevelGridProps {
  currentLevel: number;
  userId?: string;
}

export const LevelGrid = ({ currentLevel, userId }: LevelGridProps) => {
  const { levels, loading } = useLearningLevels();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  if (loading) {
    return <div className="text-center py-8">Loading levels...</div>;
  }

  const handleLevelClick = (levelNumber: number) => {
    if (levelNumber <= currentLevel) {
      setSelectedLevel(levelNumber);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Learning Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const isLocked = level.level_number > currentLevel;
            const isCompleted = level.level_number < currentLevel;
            const isCurrent = level.level_number === currentLevel;

            return (
              <Card 
                key={level.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  isLocked 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:scale-105'
                } ${
                  isCurrent ? 'ring-2 ring-primary' : ''
                } ${
                  isCompleted ? 'bg-green-500/10 border-green-500/20' : ''
                }`}
                onClick={() => handleLevelClick(level.level_number)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Level {level.level_number}
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                    </CardTitle>
                    {isCurrent && <Badge variant="default">Current</Badge>}
                    {isCompleted && <Badge variant="secondary">Complete</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{level.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {level.description}
                  </p>
                  
                  {!isLocked && (
                    <Button 
                      size="sm" 
                      variant={isCurrent ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLevel(level.level_number);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isCompleted ? 'Review' : 'Start'}
                    </Button>
                  )}
                  
                  {level.xp_required > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Requires {level.xp_required} XP
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Level Detail Modal */}
      {selectedLevel && (
        <LevelDetail
          levelNumber={selectedLevel}
          isOpen={!!selectedLevel}
          onClose={() => setSelectedLevel(null)}
          userId={userId}
        />
      )}
    </>
  );
};
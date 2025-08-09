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
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Learning Path
          </h2>
          <p className="text-muted-foreground">Progress through structured lessons to master lucid dreaming</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {levels.map((level) => {
            const isLocked = level.level_number > currentLevel;
            const isCompleted = level.level_number < currentLevel;
            const isCurrent = level.level_number === currentLevel;

            return (
              <Card 
                key={level.id} 
                className={`relative overflow-hidden group cursor-pointer transition-all duration-300 ${
                  isLocked 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1'
                } ${
                  isCurrent ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                } ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30' 
                    : isLocked 
                    ? 'bg-muted/50' 
                    : 'bg-gradient-to-br from-card to-card/80 border-primary/20 backdrop-blur-sm'
                }`}
                onClick={() => handleLevelClick(level.level_number)}
              >
                {/* Gradient overlay for active card */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                )}
                
                <CardHeader className="pb-3 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                            ? 'bg-primary text-primary-foreground'
                            : isLocked
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            level.level_number
                          )}
                        </div>
                        <CardTitle className="text-lg text-foreground">
                          Level {level.level_number}
                        </CardTitle>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {isCurrent && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{level.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {level.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    {!isLocked && (
                      <Button 
                        size="sm" 
                        variant={isCurrent ? "default" : "outline"}
                        className={`transition-all duration-200 ${
                          isCurrent 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                            : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLevel(level.level_number);
                        }}
                      >
                        <Play className="h-3 w-3 mr-2" />
                        {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                      </Button>
                    )}
                    
                    {level.xp_required > 0 && (
                      <Badge variant="outline" className="text-xs border-muted">
                        {level.xp_required} XP required
                      </Badge>
                    )}
                  </div>
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
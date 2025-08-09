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
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Learning Journey
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Progress through carefully crafted lessons designed to unlock your lucid dreaming potential
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {levels.map((level) => {
            const isLocked = level.level_number > currentLevel;
            const isCompleted = level.level_number < currentLevel;
            const isCurrent = level.level_number === currentLevel;

            return (
              <Card 
                key={level.id} 
                className={`relative group cursor-pointer glass-card oniri-hover border-white/10 ${
                  isLocked 
                    ? 'opacity-40 cursor-not-allowed' 
                    : ''
                } ${
                  isCurrent ? 'ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/20' : ''
                }`}
                onClick={() => handleLevelClick(level.level_number)}
              >
                {/* Background effects based on state */}
                <div className={`geometric-bg absolute inset-0 rounded-lg ${
                  isCompleted ? 'opacity-60' : isCurrent ? 'opacity-80' : 'opacity-30'
                }`}></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                            : isCurrent 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                            : isLocked
                            ? 'bg-white/10 text-white/50'
                            : 'bg-white/20 text-white border border-white/30'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : isLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            level.level_number
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl text-white font-bold">
                            Level {level.level_number}
                          </CardTitle>
                          <h3 className="text-lg text-white/80 font-medium mt-1">{level.title}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      {isCurrent && (
                        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-400/30 px-3 py-1">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 border-green-400/30 px-3 py-1">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-6">
                  <p className="text-white/70 leading-relaxed text-base">
                    {level.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {!isLocked && (
                      <Button 
                        size="lg" 
                        className={`transition-all duration-300 font-medium px-6 ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLevel(level.level_number);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                      </Button>
                    )}
                    
                    {level.xp_required > 0 && (
                      <Badge className="bg-white/10 text-white/70 border-white/20 px-3 py-1">
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
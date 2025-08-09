import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  compact?: boolean;
}

export const AchievementBadge = ({ 
  achievement, 
  unlocked, 
  unlockedAt, 
  compact = false 
}: AchievementBadgeProps) => {
  if (compact) {
    return (
      <div className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
        unlocked 
          ? 'bg-gradient-to-br from-yellow-400/15 to-yellow-500/10 border-yellow-400/30 shadow-sm' 
          : 'bg-muted/50 border-muted opacity-60'
      }`}>
        <div className={`text-2xl mb-2 ${unlocked ? 'animate-float' : ''}`}>{achievement.icon}</div>
        <div className="text-xs font-medium text-center text-foreground">{achievement.name}</div>
      </div>
    );
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      unlocked 
        ? 'bg-gradient-to-br from-yellow-400/10 via-yellow-500/5 to-orange-500/5 border-yellow-400/20 hover:shadow-lg hover:shadow-yellow-400/10' 
        : 'opacity-50 bg-muted/50'
    }`}>
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent" />
      )}
      
      <CardContent className="p-6 text-center relative">
        <div className={`text-5xl mb-4 ${unlocked ? 'animate-float' : ''}`}>
          {achievement.icon}
        </div>
        <h3 className="font-bold text-xl mb-3 text-foreground">{achievement.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{achievement.description}</p>
        
        <div className="flex items-center justify-center gap-3 mb-2">
          <Badge 
            variant={unlocked ? "default" : "secondary"}
            className={unlocked ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30" : ""}
          >
            +{achievement.xp_reward} XP
          </Badge>
          
          {!unlocked && (
            <Badge variant="outline" className="border-muted text-muted-foreground">
              Locked
            </Badge>
          )}
        </div>
        
        {unlocked && unlockedAt && (
          <div className="text-xs text-muted-foreground">
            Unlocked {formatDistanceToNow(new Date(unlockedAt), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
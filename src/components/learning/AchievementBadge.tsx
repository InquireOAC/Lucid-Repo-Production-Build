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
      <div className={`flex flex-col items-center p-2 rounded-lg border ${
        unlocked ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-muted opacity-50'
      }`}>
        <div className="text-2xl mb-1">{achievement.icon}</div>
        <div className="text-xs font-medium text-center">{achievement.name}</div>
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-sm ${
      unlocked ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20' : 'opacity-50'
    }`}>
      <CardContent className="p-4 text-center">
        <div className="text-4xl mb-3">{achievement.icon}</div>
        <h3 className="font-bold text-lg mb-2">{achievement.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
        
        <div className="flex items-center justify-between">
          <Badge variant={unlocked ? "default" : "secondary"}>
            {achievement.xp_reward} XP
          </Badge>
          
          {unlocked && unlockedAt && (
            <div className="text-xs text-muted-foreground">
              Unlocked {formatDistanceToNow(new Date(unlockedAt), { addSuffix: true })}
            </div>
          )}
        </div>
        
        {!unlocked && (
          <div className="mt-2">
            <Badge variant="outline">Locked</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { AcademyBadge } from '@/hooks/useAcademyBadges';
import { Award } from 'lucide-react';

interface BadgeShowcaseProps {
  badges: AcademyBadge[];
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges }) => {
  const earned = badges.filter(b => b.earned);
  if (earned.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Award size={18} className="text-primary" />
        Badges
      </h2>
      <div className="flex flex-wrap gap-2">
        {earned.map(b => (
          <div
            key={b.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-primary/20 text-xs"
            title={b.description || ''}
          >
            <Award size={14} className="text-primary" />
            <span className="font-medium text-foreground">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

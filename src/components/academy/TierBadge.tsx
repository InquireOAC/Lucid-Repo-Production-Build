import React from 'react';
import { getTierInfo } from '@/hooks/useAcademyProgress';

interface TierBadgeProps {
  tier: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md' }) => {
  const info = getTierInfo(tier);
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span className={sizeClasses[size]} title={`Tier ${tier}: ${info.name}`}>
      {info.icon}
    </span>
  );
};

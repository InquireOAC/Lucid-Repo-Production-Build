import React from 'react';
import { Moon, Cloud, Telescope, Rocket, Building } from 'lucide-react';

const TIER_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  moon: Moon,
  cloud: Cloud,
  telescope: Telescope,
  rocket: Rocket,
  building: Building,
};

interface TierBadgeProps {
  tier: number;
  size?: 'sm' | 'md' | 'lg';
  iconName?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md', iconName = 'moon' }) => {
  const sizeMap = { sm: 16, md: 24, lg: 36 };
  const IconComponent = TIER_ICONS[iconName] || Moon;

  return <IconComponent size={sizeMap[size]} className="text-primary" />;
};

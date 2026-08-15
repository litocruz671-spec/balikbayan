import { Award } from 'lucide-react';
import { TierType } from './NFTBoxCard';

interface TierBadgeProps {
  tier: TierType;
  className?: string;
}

const tierConfig: Record<TierType, { label: string; color: string; bg: string }> = {
  common: { label: 'Common', color: 'text-gray-600', bg: 'bg-gray-200' },
  silver: { label: 'Silver', color: 'text-gray-700', bg: 'bg-gray-300' },
  gold: { label: 'Gold', color: 'text-yellow-700', bg: 'bg-yellow-200' },
  diamond: { label: 'Diamond', color: 'text-blue-700', bg: 'bg-blue-200' },
  legend: { label: 'Legend', color: 'text-purple-700', bg: 'bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200' }
};

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <div className={`
      ${config.bg} ${config.color} px-3 py-1 rounded-full inline-flex items-center gap-2 font-medium
      ${className}
    `}>
      <Award size={16} />
      <span>{config.label}</span>
    </div>
  );
}

export function getTierThreshold(tier: TierType): number {
  const thresholds: Record<TierType, number> = {
    common: 0,
    silver: 5,
    gold: 12,
    diamond: 24,
    legend: 60
  };
  return thresholds[tier];
}

export function getTierFromBoxCount(count: number): TierType {
  if (count >= 60) return 'legend';
  if (count >= 24) return 'diamond';
  if (count >= 12) return 'gold';
  if (count >= 5) return 'silver';
  return 'common';
}

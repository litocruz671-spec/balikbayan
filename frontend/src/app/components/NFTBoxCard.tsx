import { Package } from 'lucide-react';

export type TierType = 'common' | 'silver' | 'gold' | 'diamond' | 'legend';

interface NFTBoxCardProps {
  boxNumber: number;
  amount: number;
  date: string;
  tier: TierType;
  countryFlag?: string;
  onClick?: () => void;
}

const tierConfig: Record<TierType, { color: string; glow: string }> = {
  common: { color: 'border-gray-300', glow: '' },
  silver: { color: 'border-gray-400', glow: 'shadow-lg shadow-gray-400/50' },
  gold: { color: 'border-yellow-500', glow: 'shadow-lg shadow-yellow-500/50' },
  diamond: { color: 'border-blue-400', glow: 'shadow-lg shadow-blue-400/50' },
  legend: { color: 'border-purple-500', glow: 'shadow-lg shadow-purple-500/50 animate-pulse' }
};

export function NFTBoxCard({ boxNumber, amount, date, tier, countryFlag = '🇵🇭', onClick }: NFTBoxCardProps) {
  const config = tierConfig[tier];

  return (
    <div
      className={`
        relative bg-white rounded-2xl border-2 ${config.color} ${config.glow}
        p-4 cursor-pointer hover:scale-105 transition-transform duration-200
      `}
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 bg-[#2C5EAD] text-white px-2 py-1 rounded text-xs font-mono">
        #{boxNumber.toString().padStart(3, '0')}
      </div>

      <div className="absolute bottom-2 right-2 text-2xl">
        {countryFlag}
      </div>

      <div className="flex flex-col items-center justify-center h-32 mb-4">
        <Package size={64} className="text-[#1591DC]" />
      </div>

      <div className="text-center space-y-1">
        <p className="font-mono font-semibold text-lg text-[#1E293B]">
          ₱{amount.toLocaleString()}
        </p>
        <p className="text-sm text-[#64748B]">{date}</p>
      </div>
    </div>
  );
}

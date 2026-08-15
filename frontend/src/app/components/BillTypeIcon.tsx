import {
  GraduationCap,
  Zap,
  Droplet,
  Wifi,
  Heart,
  Home,
  ShoppingBag,
  Pill,
  PiggyBank,
  Pencil,
  LucideIcon
} from 'lucide-react';

export type BillType = 'tuition' | 'electricity' | 'water' | 'internet' | 'medical' | 'rent' | 'grocery' | 'medicine' | 'savings' | 'custom';

interface BillTypeIconProps {
  type: BillType;
  size?: number;
  className?: string;
}

const billTypeConfig: Record<BillType, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  tuition: { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Tuition' },
  electricity: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Electricity' },
  water: { icon: Droplet, color: 'text-cyan-600', bg: 'bg-cyan-100', label: 'Water' },
  internet: { icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Internet' },
  medical: { icon: Heart, color: 'text-red-600', bg: 'bg-red-100', label: 'Medical' },
  rent: { icon: Home, color: 'text-green-600', bg: 'bg-green-100', label: 'Rent' },
  grocery: { icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Grocery' },
  medicine: { icon: Pill, color: 'text-pink-600', bg: 'bg-pink-100', label: 'Medicine' },
  savings: { icon: PiggyBank, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Savings' },
  custom: { icon: Pencil, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Custom' }
};

export function BillTypeIcon({ type, size = 24, className = '' }: BillTypeIconProps) {
  const config = billTypeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`
      ${config.bg} ${config.color} rounded-full p-2 inline-flex items-center justify-center
      ${className}
    `}>
      <Icon size={size} />
    </div>
  );
}

export function getBillTypeLabel(type: BillType): string {
  return billTypeConfig[type].label;
}

export { billTypeConfig };

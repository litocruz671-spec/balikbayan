type StatusType = 'locked' | 'fulfilled' | 'expired' | 'disputed' | 'pending';

interface StatusChipProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  locked: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#F59E0B]',
    label: 'Locked'
  },
  fulfilled: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#22C55E]',
    label: 'Fulfilled'
  },
  expired: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#EF4444]',
    label: 'Expired'
  },
  disputed: {
    bg: 'bg-[#FFEDD5]',
    text: 'text-[#F97316]',
    label: 'Disputed'
  },
  pending: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#4BB8FA]',
    label: 'Pending'
  }
};

export function StatusChip({ status, className = '' }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <span className={`
      ${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium inline-block
      ${className}
    `}>
      {config.label}
    </span>
  );
}

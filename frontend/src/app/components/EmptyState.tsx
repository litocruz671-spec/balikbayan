import { Package } from 'lucide-react';
import { Button } from './Button';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = <Package size={64} className="text-[#64748B]" />,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 opacity-50">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
        {title}
      </h3>
      <p className="text-[#64748B] mb-6 max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

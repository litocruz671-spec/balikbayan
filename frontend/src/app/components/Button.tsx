import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap';

  const variantStyles = {
    primary: 'bg-[#2C5EAD] text-white hover:bg-[#1591DC] active:bg-[#2C5EAD] disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'border-2 border-[#2C5EAD] text-[#2C5EAD] bg-white hover:bg-[#EFF6FF] active:bg-[#E2E8F0] disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed',
    ghost: 'text-[#2C5EAD] bg-transparent hover:underline disabled:text-gray-400 disabled:cursor-not-allowed',
    destructive: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#EF4444] disabled:bg-gray-300 disabled:cursor-not-allowed'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Processing...' : children}
    </button>
  );
}

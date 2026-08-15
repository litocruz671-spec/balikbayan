import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-[#1E293B]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full px-4 py-2 rounded-2xl border bg-white
            ${error ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]' : 'border-[#E2E8F0] focus:border-[#4BB8FA] focus:ring-2 focus:ring-[#4BB8FA]'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'text-[#1E293B]'}
            ${icon ? 'pr-10' : ''}
            outline-none transition-all
            ${className}
          `}
          disabled={disabled}
          {...props}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-[#EF4444]">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-[#64748B]">{helperText}</p>
      )}
    </div>
  );
}

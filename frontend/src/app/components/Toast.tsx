import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const iconMap = {
    success: <CheckCircle size={20} className="text-[#22C55E]" />,
    error: <XCircle size={20} className="text-[#EF4444]" />,
    info: <Info size={20} className="text-[#4BB8FA]" />
  };

  const borderColorMap = {
    success: 'border-l-[#22C55E]',
    error: 'border-l-[#EF4444]',
    info: 'border-l-[#4BB8FA]'
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              bg-white border-l-4 ${borderColorMap[toast.type]} rounded-2xl shadow-lg p-4 pr-12
              flex items-center gap-3 min-w-[300px] max-w-md pointer-events-auto
              animate-in slide-in-from-right duration-200
            `}
          >
            {iconMap[toast.type]}
            <p className="text-[#1E293B] flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-[#64748B] hover:text-[#1E293B]"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

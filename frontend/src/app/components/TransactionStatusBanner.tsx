import { useEffect } from 'react';
import { CheckCircle2, Loader2, XCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// App-wide visible pending/success/fail indicator for on-chain contract
// calls (create_escrow, confirm_payment, claim_refund, raise_dispute) —
// separate from the page-local success screens, so transaction status is
// visible no matter which page triggered it.
export function TransactionStatusBanner() {
  const { txStatus, txMessage, clearTxStatus } = useApp();

  useEffect(() => {
    if (txStatus === 'success') {
      const timer = setTimeout(clearTxStatus, 5000);
      return () => clearTimeout(timer);
    }
  }, [txStatus, clearTxStatus]);

  if (txStatus === 'idle') return null;

  const style = {
    pending: { icon: <Loader2 size={18} className="animate-spin text-[#1591DC]" />, bg: 'bg-[#EFF6FF] border-[#93C5FD]', text: 'text-[#2C5EAD]' },
    success: { icon: <CheckCircle2 size={18} className="text-[#22C55E]" />, bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
    error: { icon: <XCircle size={18} className="text-[#EF4444]" />, bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
  }[txStatus];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className={`flex items-center gap-3 rounded-2xl border shadow-lg px-4 py-3 ${style.bg}`}>
        {style.icon}
        <span className={`flex-1 text-sm font-medium ${style.text}`}>{txMessage}</span>
        {txStatus !== 'pending' && (
          <button onClick={clearTxStatus} aria-label="Dismiss" className={`${style.text} opacity-70 hover:opacity-100`}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

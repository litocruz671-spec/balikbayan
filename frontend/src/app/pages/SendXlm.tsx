import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ExternalLink, RefreshCw, Wallet, XCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useApp } from '../context/AppContext';
import { sendXlmPayment } from '../utils/xlmService';
import { describeWalletError } from '../utils/errors';

// A plain, minimal native-XLM transfer — separate from the BalikBayan escrow
// flow in SendMoneyWizard. This exists to give the wallet's XLM balance and a
// classic Stellar payment (Operation.payment, not a contract call) their own
// clearly visible, end-to-end demo: connect → balance → send → result.

type TxStatus = 'idle' | 'pending' | 'success' | 'error';

const isValidStellarAddress = (addr: string) => /^G[A-Z2-7]{55}$/.test(addr.trim());

export function SendXlm({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { walletAddress, xlmBalance, isBalanceLoading, refreshXlmBalance } = useApp();

  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<TxStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    refreshXlmBalance();
  }, [refreshXlmBalance]);

  const balanceNum = Number(xlmBalance) || 0;
  const amountNum = parseFloat(amount) || 0;

  const validate = (): string | null => {
    if (!destination.trim()) return 'Enter a recipient address.';
    if (!isValidStellarAddress(destination)) {
      return 'That doesn’t look like a valid Stellar address (must start with G and be 56 characters).';
    }
    if (!amount || amountNum <= 0) return 'Enter an amount greater than 0.';
    // Leave ~1 XLM for the account's minimum reserve + fees, same as Stellar itself would reject otherwise.
    if (amountNum > balanceNum - 1) {
      return `Insufficient balance. You have ${balanceNum.toFixed(2)} XLM and need to keep at least 1 XLM reserved.`;
    }
    return null;
  };

  const handleSend = async () => {
    const validationError = validate();
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('pending');
    setErrorMessage('');
    try {
      const result = await sendXlmPayment(walletAddress, destination.trim(), amount, memo || undefined);
      setTxHash(result.hash);
      setStatus('success');
      refreshXlmBalance();
    } catch (err) {
      setStatus('error');
      setErrorMessage(describeWalletError(err).message);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setTxHash('');
    setDestination('');
    setAmount('');
    setMemo('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-6"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#1E293B]">Send XLM (Testnet)</h1>
        <button
          onClick={() => refreshXlmBalance()}
          disabled={isBalanceLoading}
          className="flex items-center gap-1 text-sm text-[#1591DC] hover:underline disabled:text-[#94A3B8]"
        >
          <RefreshCw size={14} className={isBalanceLoading ? 'animate-spin' : ''} />
          Refresh balance
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center">
            <Wallet size={22} className="text-[#2C5EAD]" />
          </div>
          <div>
            <p className="text-sm text-[#64748B]">Your XLM balance</p>
            <p className="text-2xl font-bold font-mono text-[#1E293B]">
              {isBalanceLoading ? '…' : `${balanceNum.toLocaleString(undefined, { maximumFractionDigits: 7 })} XLM`}
            </p>
          </div>
        </div>
      </div>

      {status === 'success' ? (
        <div className="bg-white rounded-2xl p-8 text-center space-y-4 shadow-sm border border-[#E2E8F0]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B]">Transaction successful</h2>
          <p className="text-[#64748B]">
            Sent {amount} XLM to <span className="font-mono">{destination.slice(0, 6)}…{destination.slice(-4)}</span>
          </p>
          <div className="bg-[#EFF6FF] rounded-2xl p-3 text-left">
            <p className="text-xs text-[#64748B] mb-1">Transaction Hash</p>
            <p className="font-mono text-sm text-[#1E293B] break-all">{txHash}</p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#1591DC] hover:underline"
            >
              View on Stellar Expert <ExternalLink size={14} />
            </a>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={handleReset}>Send Another</Button>
            <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] space-y-5">
          <Input
            label="Recipient Stellar Address"
            placeholder="GXXX...XXXX"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            disabled={status === 'pending'}
          />
          <Input
            label="Amount (XLM)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={status === 'pending'}
            className="font-mono"
          />
          <Input
            label="Memo (optional)"
            placeholder="e.g., test payment"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            disabled={status === 'pending'}
            maxLength={28}
          />

          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          )}

          <Button onClick={handleSend} loading={status === 'pending'} className="w-full">
            {status === 'pending' ? 'Signing & Sending…' : 'Send XLM'}
          </Button>
          <p className="text-xs text-center text-[#64748B]">
            This is a plain Stellar testnet payment, signed with your connected wallet and submitted directly to Horizon.
          </p>
        </div>
      )}
    </div>
  );
}

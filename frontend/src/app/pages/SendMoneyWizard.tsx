import { useState } from 'react';
import { ArrowLeft, Check, Wallet, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BillType, billTypeConfig } from '../components/BillTypeIcon';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import confetti from 'canvas-confetti';

interface SendMoneyData {
  recipientAddress: string;
  recipientName: string;
  amount: string;
  billType: BillType | null;
  billDetails: Record<string, string>;
  deadline: string;
}

// Stellar testnet Friendbot funds accounts with XLM directly — no anchor or trustline needed
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export function SendMoneyWizard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SendMoneyData>({
    recipientAddress: '',
    recipientName: '',
    amount: '',
    billType: null,
    billDetails: {},
    deadline: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createEscrowOnChain, addEscrow, contractReady, walletAddress } = useApp();
  const { showToast } = useToast();

  const updateFormData = (updates: Partial<SendMoneyData>) =>
    setFormData(prev => ({ ...prev, ...updates }));

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const isValidStellarAddress = (addr: string) =>
    /^G[A-Z2-7]{55}$/.test(addr.trim());

  const handleSubmit = async () => {
    if (!formData.billType || !formData.deadline) return;

    if (contractReady && !isValidStellarAddress(formData.recipientAddress)) {
      showToast('error', 'Enter a valid Stellar address (starts with G, 56 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (contractReady && formData.recipientAddress) {
        await createEscrowOnChain({
          recipientAddress: formData.recipientAddress,
          recipientName: formData.recipientName || 'Family',
          amount: parseFloat(formData.amount) || 0,
          billType: formData.billType,
          billDetails: formData.billDetails,
          deadline: formData.deadline,
        });
        showToast('success', 'Promise locked on Stellar blockchain!');
      } else {
        // Mock mode — no contract deployed yet
        addEscrow({
          id: Math.random().toString(36).substring(2, 11),
          recipientAddress: formData.recipientAddress || 'GFAMILY...XYZ1',
          recipientName: formData.recipientName || 'Family',
          amount: parseFloat(formData.amount) || 0,
          billType: formData.billType,
          billDetails: formData.billDetails,
          status: 'locked',
          deadline: formData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        });
        if (!contractReady) {
          showToast('info', 'Demo mode: set VITE_CONTRACT_ID to go live');
        }
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setShowSuccess(true);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setStep(1);
    setFormData({ recipientAddress: '', recipientName: '', amount: '', billType: null, billDetails: {}, deadline: '' });
  };

  if (showOnRamp) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowOnRamp(false)}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2C5EAD] rounded-full flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1E293B]">Fund Your Wallet with XLM</h2>
              <p className="text-[#64748B]">Powered by Stellar Testnet Friendbot</p>
            </div>
          </div>

          <div className="bg-[#EFF6FF] rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-[#2C5EAD]">How it works</p>
            <ol className="text-sm text-[#64748B] space-y-1 list-decimal list-inside">
              <li>Click "Fund with Friendbot" below</li>
              <li>Testnet Friendbot sends free XLM directly to your address</li>
              <li>No trustline needed — every Stellar account can hold XLM</li>
              <li>Come back and send your promise</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Your Stellar address</span>
              <span className="font-mono text-[#1E293B] truncate max-w-[200px]">{walletAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Rate</span>
              <span className="font-semibold text-[#1E293B]">₱56 ≈ 1 XLM (demo rate)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Fee</span>
              <span className="font-semibold text-[#22C55E]">Less than ₱1</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => window.open(`${FRIENDBOT_URL}/?addr=${encodeURIComponent(walletAddress)}`, '_blank')}
            >
              <ExternalLink size={16} className="mr-2" />
              Fund with Friendbot
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setShowOnRamp(false)}>
              I already have XLM
            </Button>
          </div>

          <p className="text-xs text-center text-[#64748B]">
            Testnet only. On mainnet, connect a licensed PHP on/off-ramp like Coins.ph instead.
          </p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-12 text-center space-y-6 shadow-lg border border-[#E2E8F0]">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Check size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#1E293B]">Your promise is locked!</h2>
          <p className="text-[#64748B]">
            {formData.recipientName || 'Your family'} has been notified. A BalikBayan Box will be minted once the payment is confirmed.
          </p>
          {contractReady && (
            <div className="bg-[#EFF6FF] rounded-2xl p-3 text-sm text-[#2C5EAD] font-mono">
              Funds secured on Stellar blockchain ✓
            </div>
          )}
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={handleReset}>Send Another Promise</Button>
            <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => step === 1 ? onNavigate('dashboard') : handleBack()}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-6"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-[#1E293B]">Send Money</h1>
          <button
            onClick={() => setShowOnRamp(true)}
            className="text-sm text-[#1591DC] hover:underline flex items-center gap-1"
          >
            <Wallet size={14} /> Need XLM?
          </button>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${step >= i ? 'bg-[#2C5EAD] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}
              `}>
                {step > i ? <Check size={20} /> : i}
              </div>
              {i < 4 && (
                <div className={`flex-1 h-1 mx-2 ${step > i ? 'bg-[#2C5EAD]' : 'bg-[#E2E8F0]'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-[#64748B] mt-2">Step {step} of 4</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#1E293B]">Who are you sending to?</h2>
            <Input
              label="Recipient Name"
              placeholder="e.g., Nanay Rosa"
              value={formData.recipientName}
              onChange={e => updateFormData({ recipientName: e.target.value })}
            />
            <Input
              label="Recipient Stellar Wallet Address"
              placeholder="GXXX...XXXX"
              value={formData.recipientAddress}
              onChange={e => updateFormData({ recipientAddress: e.target.value })}
              helperText={
                formData.recipientAddress && !isValidStellarAddress(formData.recipientAddress)
                  ? '⚠️ Must start with G and be 56 characters'
                  : 'Ask your family to get their Stellar wallet address'
              }
            />
            <div className="pt-4">
              <Button
                onClick={handleNext}
                disabled={!formData.recipientName || (contractReady && !isValidStellarAddress(formData.recipientAddress))}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#1E293B]">How much?</h2>
            <div className="space-y-2">
              <Input
                label="Amount in PHP"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => updateFormData({ amount: e.target.value })}
                className="text-2xl font-mono"
              />
              {formData.amount && (
                <p className="text-sm text-[#64748B]">
                  ≈ {(parseFloat(formData.amount) / 56).toFixed(2)} XLM
                </p>
              )}
              <p className="text-sm text-[#22C55E]">Fee: less than ₱1</p>
            </div>
            <div className="pt-4">
              <Button
                onClick={handleNext}
                disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#1E293B]">What is this money for?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(billTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const billType = type as BillType;
                return (
                  <button
                    key={type}
                    onClick={() => updateFormData({ billType, billDetails: {} })}
                    className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      formData.billType === type
                        ? 'border-[#1591DC] bg-[#EFF6FF] shadow-md'
                        : 'border-[#E2E8F0] hover:border-[#1591DC]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`${config.bg} ${config.color} p-3 rounded-full`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-sm font-medium text-[#1E293B]">{config.label}</span>
                      {formData.billType === type && <Check size={16} className="text-[#1591DC]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.billType && (
              <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                {(formData.billType === 'tuition') && (
                  <>
                    <Input label="School Name" placeholder="e.g., Polytechnic University of the Philippines"
                      value={formData.billDetails.school || ''}
                      onChange={e => updateFormData({ billDetails: { ...formData.billDetails, school: e.target.value } })} />
                    <Input label="Student Name" placeholder="e.g., Anak Miguel"
                      value={formData.billDetails.student || ''}
                      onChange={e => updateFormData({ billDetails: { ...formData.billDetails, student: e.target.value } })} />
                  </>
                )}
                {(['electricity', 'water', 'internet'] as BillType[]).includes(formData.billType) && (
                  <>
                    <Input label="Provider" placeholder="e.g., Meralco / Maynilad / PLDT"
                      value={formData.billDetails.provider || ''}
                      onChange={e => updateFormData({ billDetails: { ...formData.billDetails, provider: e.target.value } })} />
                    <Input label="Account Number" placeholder="Enter account number"
                      value={formData.billDetails.accountNumber || ''}
                      onChange={e => updateFormData({ billDetails: { ...formData.billDetails, accountNumber: e.target.value } })} />
                  </>
                )}
                {formData.billType === 'medical' && (
                  <>
                    <Input label="Hospital/Clinic Name" placeholder="e.g., Philippine General Hospital"
                      value={formData.billDetails.hospital || ''}
                      onChange={e => updateFormData({ billDetails: { ...formData.billDetails, hospital: e.target.value } })} />
                    <Input label="Patient Name" placeholder="Enter patient name"
                      value={formData.billDetails.patient || ''}
                      onChange={e => updateFormData({ billDetails: { ...formData.billDetails, patient: e.target.value } })} />
                  </>
                )}
                <Input
                  label="Release funds if not confirmed by"
                  type="date"
                  value={formData.deadline}
                  onChange={e => updateFormData({ deadline: e.target.value })}
                  helperText="Minimum 3 days from today"
                  min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
            )}

            <div className="pt-4">
              <Button onClick={handleNext} disabled={!formData.billType || !formData.deadline} className="w-full">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#1E293B]">Review and Confirm</h2>

            <div className="space-y-4 bg-[#EFF6FF] rounded-2xl p-6">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Recipient</span>
                <span className="font-semibold text-[#1E293B]">{formData.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Amount</span>
                <span className="font-mono font-semibold text-[#1E293B]">₱{parseFloat(formData.amount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">XLM equivalent</span>
                <span className="font-mono font-semibold text-[#1E293B]">{(parseFloat(formData.amount || '0') / 56).toFixed(2)} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Bill Type</span>
                <span className="font-semibold text-[#1E293B] capitalize">{formData.billType}</span>
              </div>
              {Object.entries(formData.billDetails).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-[#64748B] capitalize">{key}</span>
                  <span className="font-semibold text-[#1E293B]">{value}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-[#64748B]">Deadline</span>
                <span className="font-semibold text-[#1E293B]">{new Date(formData.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-4">
                <span className="text-[#64748B]">Fee</span>
                <span className="font-semibold text-[#22C55E]">Less than ₱1</span>
              </div>
            </div>

            {contractReady ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-2xl">
                <Check size={16} className="text-green-600" />
                <span className="text-sm text-green-700">Will be secured on Stellar blockchain</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-sm text-amber-700">⚠️ Demo mode — set VITE_CONTRACT_ID for live transactions</span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input type="checkbox" id="confirm" className="mt-1" />
              <label htmlFor="confirm" className="text-sm text-[#64748B]">
                I confirm all details above are correct
              </label>
            </div>

            <div className="pt-4">
              <Button onClick={handleSubmit} loading={isSubmitting} className="w-full">
                {isSubmitting ? 'Signing & Sending…' : 'Lock Funds and Send Promise'}
              </Button>
              <p className="text-xs text-center text-[#64748B] mt-3">
                A BalikBayan Box will be minted to your wallet once the family confirms payment
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

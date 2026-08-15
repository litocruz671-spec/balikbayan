import { Upload, Camera, Type, QrCode, Store, X, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusChip } from '../components/StatusChip';
import { BillTypeIcon, getBillTypeLabel } from '../components/BillTypeIcon';
import { TierBadge } from '../components/TierBadge';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { useState, useRef } from 'react';
import { useToast } from '../components/Toast';
import { copyToClipboard } from '../utils/clipboard';

interface VerificationResult {
  verified: boolean;
  confidence: 'high' | 'medium' | 'low';
  amountFound: number | null;
  billTypeMatch: boolean;
  reason: string;
}

export function FamilyDashboard() {
  const { escrows: promises, confirmPaymentOnChain, updateEscrow: updatePromise, currentTier, walletAddress, contractReady } = useApp();
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | null>(null);
  const [selectedPromiseForDetails, setSelectedPromiseForDetails] = useState<typeof promises[0] | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'photo' | 'qr' | 'manual'>('photo');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [showTierQR, setShowTierQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const familyPromises = promises.filter(p => p.status !== 'fulfilled');

  const selectedPromise = selectedPromiseId ? promises.find(p => p.id === selectedPromiseId) : null;

  const handleSubmitProof = (promiseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPromiseId(promiseId);
    setVerificationResult(null);
    setUploadedImage(null);
    setShowProofModal(true);
  };

  const handleViewDetails = (promise: typeof promises[0]) => {
    setSelectedPromiseForDetails(promise);
  };

  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address);
    showToast(success ? 'success' : 'error', success ? 'Copied to clipboard' : 'Failed to copy');
  };

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
    if (days < 0) return 'Expired';
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setUploadedImage({ base64, mimeType: file.type, preview: dataUrl });
      setVerificationResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAIVerify = async () => {
    if (!uploadedImage || !selectedPromise) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetch('/api/verify-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImage.base64,
          mimeType: uploadedImage.mimeType,
          billType: selectedPromise.billType,
          expectedAmount: selectedPromise.amount,
        }),
      });
      const data: VerificationResult = await res.json();
      setVerificationResult(data);
    } catch {
      setVerificationResult({ verified: false, confidence: 'low', amountFound: null, billTypeMatch: false, reason: 'Verification service unavailable' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPromiseId) return;
    setIsVerifying(true);
    try {
      if (contractReady) {
        await confirmPaymentOnChain(selectedPromiseId);
        showToast('success', 'Payment confirmed! Funds released and BalikBayan Box minted.');
      } else {
        // Mock mode
        updatePromise(selectedPromiseId, { status: 'fulfilled' });
        showToast('success', 'Payment confirmed! (Demo mode)');
      }
      setShowProofModal(false);
      setSelectedPromiseId(null);
      setVerificationResult(null);
      setUploadedImage(null);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to confirm payment');
    } finally {
      setIsVerifying(false);
    }
  };

  const tierPerks = [
    { merchant: 'SM Supermarket', discount: '5% off on all purchases', tier: 'silver', locked: currentTier === 'common' },
    { merchant: 'Jollibee', discount: '10% off on family meals', tier: 'gold', locked: currentTier === 'common' || currentTier === 'silver' },
    { merchant: 'Mercury Drug', discount: '15% off on medicines', tier: 'diamond', locked: currentTier !== 'diamond' && currentTier !== 'legend' },
    { merchant: 'National Bookstore', discount: '20% off on school supplies', tier: 'legend', locked: currentTier !== 'legend' },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-[#1E293B]">Family Dashboard</h1>

        <div className={`rounded-2xl p-6 text-white ${
          currentTier === 'legend' ? 'bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500' :
          currentTier === 'diamond' ? 'bg-blue-500' :
          currentTier === 'gold' ? 'bg-yellow-500' :
          currentTier === 'silver' ? 'bg-gray-400' : 'bg-gray-500'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <TierBadge tier={currentTier} />
              <p className="mt-2 text-lg">
                {currentTier === 'legend' ? "You've reached Legend status! Enjoy VIP benefits!" :
                 currentTier === 'diamond' ? 'Show this at partner merchants for 15% off' :
                 currentTier === 'gold' ? 'Show this at partner merchants for 10% off' :
                 currentTier === 'silver' ? 'Show this at partner merchants for 5% off' :
                 'Complete 5 promises to reach Silver Tier'}
              </p>
            </div>
            {currentTier !== 'common' && (
              <Button onClick={() => setShowTierQR(true)} className="bg-white text-[#2C5EAD] hover:bg-gray-100">
                <QrCode size={20} className="mr-2" /> Show My Tier
              </Button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Bills to Confirm</h2>
          {familyPromises.length === 0 ? (
            <Card>
              <EmptyState title="No bills to confirm" description="When your family sends money, bills will appear here for you to confirm" />
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {familyPromises.map(promise => (
                <Card key={promise.id} hoverable onClick={() => handleViewDetails(promise)}>
                  <div className="flex items-start gap-4">
                    <BillTypeIcon type={promise.billType} />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-[#1E293B]">
                            {getBillTypeLabel(promise.billType)}
                            {promise.billDetails.provider && ` - ${promise.billDetails.provider}`}
                          </h3>
                          <p className="text-sm text-[#64748B]">{getDaysLeft(promise.deadline)}</p>
                        </div>
                        <StatusChip status={promise.status} />
                      </div>
                      <p className="text-2xl font-mono font-bold text-[#1E293B]">₱{promise.amount.toLocaleString()}</p>
                      {promise.status === 'locked' && (
                        <Button onClick={e => handleSubmitProof(promise.id, e)} className="w-full mt-3">
                          Submit Proof of Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Your Current Perks</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tierPerks.map((perk, idx) => (
              <Card key={idx} className={perk.locked ? 'opacity-50' : ''} hoverable={!perk.locked}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Store size={32} className="text-gray-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-[#1E293B]">{perk.merchant}</h3>
                    <p className="text-[#64748B]">{perk.discount}</p>
                    {perk.locked ? (
                      <p className="text-sm text-[#F59E0B]">Reach {perk.tier.charAt(0).toUpperCase() + perk.tier.slice(1)} Tier to unlock</p>
                    ) : (
                      <Button variant="secondary" className="w-full" onClick={() => setShowTierQR(true)}>
                        Show QR Code
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Promise details modal */}
      {selectedPromiseForDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedPromiseForDetails(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <BillTypeIcon type={selectedPromiseForDetails.billType} size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-[#1E293B]">{getBillTypeLabel(selectedPromiseForDetails.billType)} Promise</h2>
                  <p className="text-[#64748B]">From OFW Sender</p>
                </div>
              </div>
              <button onClick={() => setSelectedPromiseForDetails(null)} className="text-[#64748B] hover:text-[#1E293B]"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-[#EFF6FF] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Amount</span>
                  <span className="text-3xl font-mono font-bold text-[#1E293B]">₱{selectedPromiseForDetails.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Status</span>
                  <StatusChip status={selectedPromiseForDetails.status} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Deadline</p>
                  <p className="font-semibold text-[#1E293B]">{new Date(selectedPromiseForDetails.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Time Left</p>
                  <p className="font-semibold text-[#1E293B]">{getDaysLeft(selectedPromiseForDetails.deadline)}</p>
                </div>
              </div>
              {Object.keys(selectedPromiseForDetails.billDetails).length > 0 && (
                <div>
                  <p className="text-sm text-[#64748B] mb-2">Bill Details</p>
                  <div className="bg-[#EFF6FF] p-4 rounded-2xl space-y-2">
                    {Object.entries(selectedPromiseForDetails.billDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-[#64748B] capitalize">{key}</span>
                        <span className="font-semibold text-[#1E293B]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedPromiseForDetails.status === 'locked' && (
                <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                  <Button onClick={e => { setSelectedPromiseForDetails(null); handleSubmitProof(selectedPromiseForDetails.id, e); }} className="flex-1">
                    Submit Proof of Payment
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proof submission modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1E293B]">
                Prove {selectedPromise && getBillTypeLabel(selectedPromise.billType)} was paid
              </h2>
              <button onClick={() => { setShowProofModal(false); setVerificationResult(null); setUploadedImage(null); }} className="text-[#64748B] hover:text-[#1E293B]">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              {(['photo', 'qr', 'manual'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setUploadMethod(method)}
                  className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all ${uploadMethod === method ? 'border-[#1591DC] bg-[#EFF6FF]' : 'border-[#E2E8F0]'}`}
                >
                  {method === 'photo' && <Upload size={20} className="mx-auto mb-1" />}
                  {method === 'qr' && <QrCode size={20} className="mx-auto mb-1" />}
                  {method === 'manual' && <Type size={20} className="mx-auto mb-1" />}
                  <span className="text-sm">{method === 'photo' ? 'Upload Receipt' : method === 'qr' ? 'Scan QR' : 'Type Details'}</span>
                </button>
              ))}
            </div>

            {uploadMethod === 'photo' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img src={uploadedImage.preview} alt="Receipt" className="w-full rounded-2xl max-h-64 object-contain border border-[#E2E8F0]" />
                      <button
                        onClick={() => { setUploadedImage(null); setVerificationResult(null); }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {!verificationResult && (
                      <Button onClick={handleAIVerify} loading={isVerifying} className="w-full">
                        {isVerifying ? 'AI Verifying Receipt…' : 'Verify with AI'}
                      </Button>
                    )}
                    {verificationResult && (
                      <div className={`p-4 rounded-2xl border ${verificationResult.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {verificationResult.verified
                            ? <CheckCircle size={20} className="text-green-600" />
                            : <AlertCircle size={20} className="text-red-600" />}
                          <span className={`font-semibold ${verificationResult.verified ? 'text-green-700' : 'text-red-700'}`}>
                            {verificationResult.verified ? 'Receipt Verified' : 'Verification Failed'}
                            <span className="ml-2 text-xs font-normal opacity-70">({verificationResult.confidence} confidence)</span>
                          </span>
                        </div>
                        <p className="text-sm opacity-80">{verificationResult.reason}</p>
                        {verificationResult.amountFound && (
                          <p className="text-sm mt-1">Amount found: ₱{verificationResult.amountFound.toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center hover:border-[#1591DC] transition-colors cursor-pointer"
                  >
                    <Upload size={48} className="mx-auto text-[#64748B] mb-4" />
                    <p className="text-[#1E293B] font-medium mb-2">Drop receipt photo here or click to upload</p>
                    <p className="text-sm text-[#64748B]">PNG, JPG up to 10MB — AI will verify it automatically</p>
                  </button>
                )}
              </div>
            )}

            {uploadMethod === 'qr' && (
              <div className="border-2 border-[#E2E8F0] rounded-2xl p-12 text-center">
                <Camera size={48} className="mx-auto text-[#64748B] mb-4" />
                <p className="text-[#1E293B] font-medium mb-2">Open camera to scan payment QR code</p>
                <Button onClick={() => showToast('info', 'Camera QR scanning coming soon')}>Open Camera</Button>
              </div>
            )}

            {uploadMethod === 'manual' && (
              <div className="space-y-4">
                <input type="text" placeholder="Account Number / Reference Number" className="w-full px-4 py-2 border border-[#E2E8F0] rounded-2xl" />
                <input type="number" placeholder="Amount Paid (PHP)" className="w-full px-4 py-2 border border-[#E2E8F0] rounded-2xl" />
                <input type="text" placeholder="Date of Payment" className="w-full px-4 py-2 border border-[#E2E8F0] rounded-2xl" />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleConfirmPayment}
                loading={isVerifying}
                disabled={uploadMethod === 'photo' && !uploadedImage && !verificationResult}
                className="flex-1"
              >
                {contractReady ? 'Confirm Payment on Chain' : 'Confirm Payment'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setShowProofModal(false); setVerificationResult(null); setUploadedImage(null); }}
                disabled={isVerifying}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            {contractReady && (
              <p className="text-xs text-center text-[#64748B] mt-3">
                This will call <code>confirm_payment</code> on the Stellar blockchain and release funds to your wallet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tier QR modal */}
      {showTierQR && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowTierQR(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#1E293B]">My Tier Badge</h2>
              <button onClick={() => setShowTierQR(false)} className="text-[#64748B] hover:text-[#1E293B]"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <p className="text-[#64748B] text-center">Show this QR code at partner merchants to get your discount</p>
              <div className={`mx-auto w-64 h-64 rounded-2xl flex flex-col items-center justify-center ${
                currentTier === 'legend' ? 'bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200' :
                currentTier === 'diamond' ? 'bg-blue-100' :
                currentTier === 'gold' ? 'bg-yellow-100' : 'bg-gray-200'
              }`}>
                <QrCode size={120} className="text-[#2C5EAD] mb-4" />
                <div className="bg-white px-4 py-2 rounded-2xl shadow-md"><TierBadge tier={currentTier} /></div>
              </div>
              <div className="p-4 bg-[#EFF6FF] rounded-2xl">
                <p className="text-sm text-[#64748B] mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-[#1E293B] break-all flex-1">{walletAddress}</p>
                  <button onClick={() => handleCopyAddress(walletAddress)} className="text-[#1591DC]"><Copy size={14} /></button>
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                <p className="font-semibold text-green-800">
                  {currentTier === 'legend' ? '20%' : currentTier === 'diamond' ? '15%' : currentTier === 'gold' ? '10%' : '5%'} Discount
                </p>
                <p className="text-sm text-green-700">Valid at all partner merchants</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => showToast('success', 'QR code saved!')} className="flex-1">Save QR Code</Button>
                <Button variant="secondary" onClick={() => setShowTierQR(false)} className="flex-1">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

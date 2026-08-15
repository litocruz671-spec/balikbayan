import { Lock, Package, TrendingUp, Calendar, X, ExternalLink, Copy } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusChip } from '../components/StatusChip';
import { Button } from '../components/Button';
import { BillTypeIcon, getBillTypeLabel } from '../components/BillTypeIcon';
import { NFTBoxCard } from '../components/NFTBoxCard';
import { TierBadge } from '../components/TierBadge';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { useToast } from '../components/Toast';
import { copyToClipboard } from '../utils/clipboard';

export function OFWDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { escrows: promises, nftBoxes, currentTier, claimRefundOnChain, updateEscrow: updatePromise } = useApp();
  const { showToast } = useToast();
  const [selectedPromise, setSelectedPromise] = useState<typeof promises[0] | null>(null);
  const [selectedBox, setSelectedBox] = useState<typeof nftBoxes[0] | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const activePromises = promises.filter(p => p.status === 'locked' || p.status === 'pending');
  const totalSentThisMonth = promises
    .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  const nextTierBoxes = (() => {
    if (nftBoxes.length < 5) return 5 - nftBoxes.length;
    if (nftBoxes.length < 12) return 12 - nftBoxes.length;
    if (nftBoxes.length < 24) return 24 - nftBoxes.length;
    if (nftBoxes.length < 60) return 60 - nftBoxes.length;
    return 0;
  })();

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  };

  const handleCancelPromise = async (promiseId: string) => {
    setIsCancelling(true);
    try {
      const escrow = promises.find(p => p.id === promiseId);
      if (escrow?.onChainId) {
        await claimRefundOnChain(promiseId);
        showToast('success', 'Refund claimed on Stellar blockchain');
      } else {
        updatePromise(promiseId, { status: 'expired' });
        showToast('success', 'Promise cancelled');
      }
      setSelectedPromise(null);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      showToast('success', 'Copied to clipboard');
    } else {
      showToast('error', 'Failed to copy. Please select and copy manually.');
    }
  };

  const handleShareBox = (_box: typeof nftBoxes[0]) => {
    showToast('success', 'Box image saved! Share with your family and friends.');
  };

  const handleViewOnExplorer = (hash: string) => {
    window.open(`https://stellar.expert/explorer/testnet/tx/${hash}`, '_blank');
    showToast('info', 'Opening Stellar Explorer...');
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1E293B]">OFW Dashboard</h1>
        <Button onClick={() => onNavigate('send')}>
          Send Money
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Total Sent This Month</p>
              <p className="text-2xl font-mono font-bold text-[#1E293B]">₱{totalSentThisMonth.toLocaleString()}</p>
            </div>
            <TrendingUp size={32} className="text-[#22C55E]" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Active Promises</p>
              <p className="text-2xl font-bold text-[#1E293B]">{activePromises.length}</p>
            </div>
            <Lock size={32} className="text-[#F59E0B]" />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#64748B]">Current Tier</p>
            <TierBadge tier={currentTier} />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#64748B]">Boxes to Next Tier</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#E2E8F0] rounded-full h-2">
                <div
                  className="bg-[#1591DC] h-2 rounded-full transition-all"
                  style={{ width: `${nextTierBoxes > 0 ? ((5 - nextTierBoxes) / 5) * 100 : 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-[#1E293B]">{nextTierBoxes}</span>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1E293B]">Your Active Promises</h2>
        </div>

        {activePromises.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Lock size={64} className="text-[#64748B]" />}
              title="No active promises"
              description="Send your first promise to help your family back home"
              actionLabel="Send Promise"
              onAction={() => onNavigate('send')}
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activePromises.map(promise => (
              <Card key={promise.id} hoverable onClick={() => setSelectedPromise(promise)}>
                <div className="flex items-start gap-4">
                  <BillTypeIcon type={promise.billType} />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#1E293B]">{getBillTypeLabel(promise.billType)}</h3>
                        <p className="text-sm text-[#64748B]">{promise.recipientName}</p>
                      </div>
                      <StatusChip status={promise.status} />
                    </div>
                    <p className="text-2xl font-mono font-bold text-[#1E293B]">₱{promise.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Calendar size={16} />
                      <span>{getDaysLeft(promise.deadline)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1E293B]">Recent BalikBayan Boxes</h2>
          <Button variant="ghost" onClick={() => onNavigate('boxes')}>
            View Full Collection
          </Button>
        </div>

        {nftBoxes.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Package size={64} className="text-[#64748B]" />}
              title="No boxes yet"
              description="Complete your first promise to earn your first BalikBayan box"
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {nftBoxes.slice(-3).reverse().map(box => (
              <NFTBoxCard
                key={box.id}
                boxNumber={box.boxNumber}
                amount={box.amount}
                date={box.date}
                tier={box.tier}
                countryFlag={box.countryFlag}
                onClick={() => setSelectedBox(box)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Recent Activity</h2>
        <Card>
          <div className="space-y-4">
            {promises.slice(-5).reverse().map((promise) => (
              <div key={promise.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  promise.status === 'fulfilled' ? 'bg-[#22C55E]' :
                  promise.status === 'locked' ? 'bg-[#F59E0B]' :
                  'bg-[#4BB8FA]'
                }`}></div>
                <div className="flex-1">
                  <p className="text-[#1E293B]">
                    {promise.status === 'fulfilled' && 'Funds released for '}
                    {promise.status === 'locked' && 'Promise created for '}
                    {promise.status === 'pending' && 'Proof submitted for '}
                    <span className="font-semibold">{getBillTypeLabel(promise.billType)}</span>
                    {' — '}₱{promise.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#64748B]">{new Date(promise.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {promises.length === 0 && (
              <p className="text-center text-[#64748B] py-8">No activity yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>

    {selectedPromise && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedPromise(null)}>
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <BillTypeIcon type={selectedPromise.billType} size={32} />
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B]">{getBillTypeLabel(selectedPromise.billType)} Promise</h2>
                <p className="text-[#64748B]">Sent to {selectedPromise.recipientName}</p>
              </div>
            </div>
            <button onClick={() => setSelectedPromise(null)} className="text-[#64748B] hover:text-[#1E293B]">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-[#EFF6FF] rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Amount</span>
                <span className="text-3xl font-mono font-bold text-[#1E293B]">₱{selectedPromise.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Status</span>
                <StatusChip status={selectedPromise.status} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Recipient Name</p>
                <p className="font-semibold text-[#1E293B]">{selectedPromise.recipientName}</p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Deadline</p>
                <p className="font-semibold text-[#1E293B]">{new Date(selectedPromise.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Created</p>
                <p className="font-semibold text-[#1E293B]">{new Date(selectedPromise.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Time Left</p>
                <p className="font-semibold text-[#1E293B]">{getDaysLeft(selectedPromise.deadline)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#64748B] mb-2">Recipient Wallet Address</p>
              <div className="flex items-center gap-2 bg-[#EFF6FF] p-3 rounded-2xl">
                <p className="font-mono text-sm text-[#1E293B] flex-1 truncate">{selectedPromise.recipientAddress}</p>
                <button
                  onClick={() => handleCopyAddress(selectedPromise.recipientAddress)}
                  className="text-[#1591DC] hover:text-[#2C5EAD]"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {Object.keys(selectedPromise.billDetails).length > 0 && (
              <div>
                <p className="text-sm text-[#64748B] mb-2">Bill Details</p>
                <div className="bg-[#EFF6FF] p-4 rounded-2xl space-y-2">
                  {Object.entries(selectedPromise.billDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-[#64748B] capitalize">{key}</span>
                      <span className="font-semibold text-[#1E293B]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPromise.status === 'pending' && selectedPromise.proofImage && (
              <div>
                <p className="text-sm text-[#64748B] mb-2">Submitted Proof</p>
                <div className="bg-[#EFF6FF] p-4 rounded-2xl">
                  <p className="text-sm text-[#1E293B]">Receipt image has been submitted and is being verified.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => handleViewOnExplorer('TX' + Math.random().toString(36).substring(2, 18).toUpperCase())}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#E2E8F0] text-[#1E293B] rounded-2xl hover:bg-[#EFF6FF] transition-colors"
              >
                <ExternalLink size={16} />
                View on Explorer
              </button>
              {selectedPromise.status === 'locked' && (
                <Button
                  variant="destructive"
                  loading={isCancelling}
                  onClick={() => handleCancelPromise(selectedPromise.id)}
                  className="flex-1"
                >
                  {selectedPromise.onChainId ? 'Claim Refund' : 'Cancel Promise'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {selectedBox && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedBox(null)}>
        <div className="bg-white rounded-2xl max-w-3xl w-full p-8 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-[#1E293B]">BalikBayan Box Details</h2>
            <button onClick={() => setSelectedBox(null)} className="text-[#64748B] hover:text-[#1E293B]">
              <X size={24} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <NFTBoxCard
                boxNumber={selectedBox.boxNumber}
                amount={selectedBox.amount}
                date={selectedBox.date}
                tier={selectedBox.tier}
                countryFlag={selectedBox.countryFlag}
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#64748B]">Box Number</p>
                <p className="font-mono font-semibold text-[#1E293B]">#{selectedBox.boxNumber.toString().padStart(3, '0')}</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B]">Amount Sent</p>
                <p className="font-mono text-xl font-semibold text-[#1E293B]">₱{selectedBox.amount.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B]">Date</p>
                <p className="font-semibold text-[#1E293B]">{selectedBox.date}</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B]">Country</p>
                <p className="font-semibold text-[#1E293B]">{selectedBox.countryFlag} Philippines</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B]">Bill Type</p>
                <p className="font-semibold text-[#1E293B] capitalize">{selectedBox.billType}</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B] mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2 bg-[#EFF6FF] p-3 rounded-2xl">
                  <p className="font-mono text-sm text-[#1E293B] flex-1 break-all">{selectedBox.transactionHash}</p>
                  <button
                    onClick={() => handleCopyAddress(selectedBox.transactionHash)}
                    className="text-[#1591DC] hover:text-[#2C5EAD]"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#64748B]">Tier</p>
                <TierBadge tier={selectedBox.tier} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={() => handleShareBox(selectedBox)}
                  className="flex-1 px-4 py-2 bg-[#2C5EAD] text-white rounded-2xl hover:bg-[#1591DC] transition-colors"
                >
                  Share My Box
                </button>
                <button
                  onClick={() => handleViewOnExplorer(selectedBox.transactionHash)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#E2E8F0] text-[#1E293B] rounded-2xl hover:bg-[#EFF6FF] transition-colors"
                >
                  <ExternalLink size={16} />
                  View on Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

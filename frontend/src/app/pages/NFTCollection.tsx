import { Package, Award, TrendingUp, Calendar, Filter, ExternalLink } from 'lucide-react';
import { Card } from '../components/Card';
import { NFTBoxCard } from '../components/NFTBoxCard';
import { TierBadge, getTierThreshold } from '../components/TierBadge';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { useToast } from '../components/Toast';
import { useEscapeKey } from '../utils/useEscapeKey';

export function NFTCollection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { nftBoxes, currentTier } = useApp();
  const { showToast } = useToast();
  const [selectedBox, setSelectedBox] = useState<typeof nftBoxes[0] | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');

  useEscapeKey(!!selectedBox, () => setSelectedBox(null));

  const totalAmount = nftBoxes.reduce((sum, box) => sum + box.amount, 0);
  const memberSince = nftBoxes.length > 0 ? new Date(nftBoxes[0].date).toLocaleDateString() : 'N/A';

  const filteredBoxes = filterTier === 'all'
    ? nftBoxes
    : nftBoxes.filter(box => box.tier === filterTier);

  const handleShareBox = (_box: typeof nftBoxes[0]) => {
    showToast('success', 'Box image saved! Share with your family and friends.');
  };

  const handleViewOnExplorer = (hash: string) => {
    window.open(`https://stellar.expert/explorer/testnet/tx/${hash}`, '_blank');
    showToast('info', 'Opening Stellar Explorer...');
  };

  const tierProgress = [
    { tier: 'common', threshold: 0, current: nftBoxes.length >= 0 },
    { tier: 'silver', threshold: 5, current: nftBoxes.length >= 5 },
    { tier: 'gold', threshold: 12, current: nftBoxes.length >= 12 },
    { tier: 'diamond', threshold: 24, current: nftBoxes.length >= 24 },
    { tier: 'legend', threshold: 60, current: nftBoxes.length >= 60 }
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-[#1E293B]">My BalikBayan Boxes</h1>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Total Boxes</p>
                <p className="text-2xl font-bold text-[#1E293B]">{nftBoxes.length}</p>
              </div>
              <Package size={32} className="text-[#1591DC]" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Lifetime Sent</p>
                <p className="text-xl font-mono font-bold text-[#1E293B]">₱{totalAmount.toLocaleString()}</p>
              </div>
              <TrendingUp size={32} className="text-[#22C55E]" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-[#1E293B]">3 months</p>
              </div>
              <Award size={32} className="text-[#F59E0B]" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Member Since</p>
                <p className="text-sm font-semibold text-[#1E293B]">{memberSince}</p>
              </div>
              <Calendar size={32} className="text-[#4BB8FA]" />
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Tier Progress</h2>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {tierProgress.map((tier, idx) => (
              <div key={tier.tier} className="flex items-center gap-2">
                <div className={`
                  flex flex-col items-center gap-2 min-w-[100px]
                  ${tier.current ? 'opacity-100' : 'opacity-40'}
                `}>
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center border-4
                    ${tier.tier === 'common' ? 'border-gray-400 bg-gray-100' :
                      tier.tier === 'silver' ? 'border-gray-500 bg-gray-200' :
                      tier.tier === 'gold' ? 'border-yellow-500 bg-yellow-100' :
                      tier.tier === 'diamond' ? 'border-blue-500 bg-blue-100' :
                      'border-purple-500 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100'}
                  `}>
                    {tier.current && <Award size={24} className="text-current" />}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#1E293B] capitalize">{tier.tier}</p>
                    <p className="text-xs text-[#64748B]">{tier.threshold} boxes</p>
                  </div>
                </div>
                {idx < tierProgress.length - 1 && (
                  <div className={`h-1 w-12 rounded ${tier.current ? 'bg-[#1591DC]' : 'bg-[#E2E8F0]'}`}></div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#1E293B]">Box Collection</h2>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#64748B]" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-2xl text-sm"
            >
              <option value="all">All Tiers</option>
              <option value="common">Common</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="diamond">Diamond</option>
              <option value="legend">Legend</option>
            </select>
          </div>
        </div>

        {filteredBoxes.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Package size={64} className="text-[#64748B]" />}
              title="No boxes yet"
              description="Complete your first promise to earn your first BalikBayan box"
              actionLabel="Send Money"
              onAction={() => onNavigate('send')}
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBoxes.map(box => (
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

      {selectedBox && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedBox(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
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
                <h2 className="text-2xl font-bold text-[#1E293B]">Box Details</h2>

                <div className="space-y-3">
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
                    <p className="text-sm text-[#64748B]">Transaction Hash</p>
                    <p className="font-mono text-sm text-[#1E293B] break-all">{selectedBox.transactionHash}</p>
                  </div>

                  <div>
                    <p className="text-sm text-[#64748B]">Tier</p>
                    <TierBadge tier={selectedBox.tier} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
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

                <button
                  onClick={() => setSelectedBox(null)}
                  className="w-full py-2 text-[#64748B] hover:text-[#1E293B]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { QrCode, Users, DollarSign, TrendingUp, Camera, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TierBadge } from '../components/TierBadge';
import { useState } from 'react';

export function MerchantDashboard() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<null | {
    tier: 'silver' | 'gold' | 'diamond' | 'legend';
    discount: string;
    valid: boolean;
  }>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<null | {
    wallet: string;
    tier: string;
    discount: string;
    timestamp: string;
  }>(null);

  const handleScan = () => {
    setShowScanner(true);

    setTimeout(() => {
      setScanResult({
        tier: 'gold',
        discount: '10% off',
        valid: true
      });
      setShowScanner(false);
    }, 2000);
  };

  const recentRedemptions = [
    { wallet: 'GCUST...ABC1', tier: 'gold', discount: '10%', timestamp: '2 minutes ago' },
    { wallet: 'GCUST...XYZ2', tier: 'silver', discount: '5%', timestamp: '15 minutes ago' },
    { wallet: 'GCUST...DEF3', tier: 'diamond', discount: '15%', timestamp: '1 hour ago' },
    { wallet: 'GCUST...GHI4', tier: 'legend', discount: '20%', timestamp: '2 hours ago' }
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-[#1E293B]">Merchant Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Redemptions This Month</p>
                <p className="text-2xl font-bold text-[#1E293B]">247</p>
              </div>
              <TrendingUp size={32} className="text-[#22C55E]" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Customers Reached</p>
                <p className="text-2xl font-bold text-[#1E293B]">1,842</p>
              </div>
              <Users size={32} className="text-[#1591DC]" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Estimated Discount Value</p>
                <p className="text-xl font-mono font-bold text-[#1E293B]">₱24,500</p>
              </div>
              <DollarSign size={32} className="text-[#F59E0B]" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-[#1E293B] mb-6">Scan Customer QR</h2>

            <div className="flex flex-col items-center gap-6">
              <div className="w-64 h-64 bg-[#EFF6FF] rounded-2xl flex items-center justify-center border-2 border-dashed border-[#1591DC]">
                {showScanner ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 border-4 border-[#1591DC] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#64748B]">Scanning...</p>
                  </div>
                ) : scanResult ? (
                  <div className="text-center p-6">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      scanResult.valid ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {scanResult.valid ? (
                        <QrCode size={40} className="text-green-600" />
                      ) : (
                        <span className="text-4xl">❌</span>
                      )}
                    </div>
                    <TierBadge tier={scanResult.tier} className="mb-2" />
                    <p className="text-2xl font-bold text-[#1E293B] mb-1">{scanResult.discount}</p>
                    <p className={`text-sm ${scanResult.valid ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {scanResult.valid ? 'Valid' : 'Invalid'}
                    </p>
                  </div>
                ) : (
                  <Camera size={64} className="text-[#64748B]" />
                )}
              </div>

              <Button onClick={handleScan} className="w-full">
                <QrCode size={20} />
                Scan Customer QR Code
              </Button>

              {scanResult && (
                <Button
                  variant="secondary"
                  onClick={() => setScanResult(null)}
                  className="w-full"
                >
                  Scan Another
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Recent Redemptions</h2>

            <div className="space-y-3">
              {recentRedemptions.map((redemption, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#EFF6FF] rounded-2xl cursor-pointer hover:bg-[#E0EDFF] transition-colors"
                  onClick={() => setSelectedRedemption(redemption)}
                >
                  <div className="flex items-center gap-3">
                    <TierBadge tier={redemption.tier as any} />
                    <div>
                      <p className="font-mono text-sm text-[#1E293B]">{redemption.wallet}</p>
                      <p className="text-xs text-[#64748B]">{redemption.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#22C55E]">{redemption.discount}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Tier Discount Structure</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 border-2 border-gray-300 rounded-2xl">
              <TierBadge tier="silver" className="mb-2" />
              <p className="text-2xl font-bold text-[#1E293B]">5% off</p>
              <p className="text-sm text-[#64748B]">5+ boxes</p>
            </div>
            <div className="p-4 border-2 border-yellow-400 rounded-2xl">
              <TierBadge tier="gold" className="mb-2" />
              <p className="text-2xl font-bold text-[#1E293B]">10% off</p>
              <p className="text-sm text-[#64748B]">12+ boxes</p>
            </div>
            <div className="p-4 border-2 border-blue-400 rounded-2xl">
              <TierBadge tier="diamond" className="mb-2" />
              <p className="text-2xl font-bold text-[#1E293B]">15% off</p>
              <p className="text-sm text-[#64748B]">24+ boxes</p>
            </div>
            <div className="p-4 border-2 border-purple-400 rounded-2xl">
              <TierBadge tier="legend" className="mb-2" />
              <p className="text-2xl font-bold text-[#1E293B]">20% off</p>
              <p className="text-sm text-[#64748B]">60+ boxes</p>
            </div>
          </div>
        </Card>
      </div>

      {selectedRedemption && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedRedemption(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-[#1E293B]">Redemption Details</h2>
              <button onClick={() => setSelectedRedemption(null)} aria-label="Close" className="text-[#64748B] hover:text-[#1E293B]">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#EFF6FF] rounded-2xl p-4">
                <p className="text-sm text-[#64748B] mb-1">Customer Tier</p>
                <TierBadge tier={selectedRedemption.tier as any} />
              </div>

              <div>
                <p className="text-sm text-[#64748B] mb-1">Customer Wallet</p>
                <p className="font-mono text-sm text-[#1E293B] bg-[#EFF6FF] p-3 rounded-2xl">{selectedRedemption.wallet}</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B] mb-1">Discount Applied</p>
                <p className="text-2xl font-bold text-[#22C55E]">{selectedRedemption.discount}</p>
              </div>

              <div>
                <p className="text-sm text-[#64748B] mb-1">Timestamp</p>
                <p className="font-semibold text-[#1E293B]">{selectedRedemption.timestamp}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-sm text-green-800">✓ Redemption verified successfully</p>
              </div>

              <Button onClick={() => setSelectedRedemption(null)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

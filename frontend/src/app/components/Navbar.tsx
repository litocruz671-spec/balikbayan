import { Package, User, Bell, ChevronDown, Globe } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

function formatXlm(balance: string): string {
  const n = Number(balance);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : balance;
}

export function Navbar() {
  const {
    walletConnected, walletAddress, walletError, connectWallet, disconnectWallet,
    userRole, setUserRole, xlmBalance, isBalanceLoading,
  } = useApp();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // connectWallet() never throws (failures land in context's walletError), and
  // walletAddress here would otherwise be a stale closure value captured before
  // the connect call resolves — so we react to the context value updating
  // instead of checking it synchronously right after the await.
  useEffect(() => {
    if (walletConnected && !userRole) {
      setShowRoleModal(true);
    }
  }, [walletConnected, userRole]);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2C5EAD] to-[#4BB8FA] flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                <Package size={16} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold">
                  <span className="text-[#2C5EAD]">Balik</span>
                  <span className="text-[#1591DC]">Bayan</span>
                </span>
                <span className="text-xs text-[#64748B] italic">Every peso sent. Every sacrifice remembered.</span>
              </div>
            </div>

            {walletConnected && userRole && (
              <div className="flex items-center gap-2 bg-[#EFF6FF] rounded-2xl p-1">
                <button
                  onClick={() => setUserRole('ofw')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    userRole === 'ofw' ? 'bg-[#2C5EAD] text-white' : 'text-[#1E293B] hover:bg-white'
                  }`}
                >
                  OFW View
                </button>
                <button
                  onClick={() => setUserRole('family')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    userRole === 'family' ? 'bg-[#2C5EAD] text-white' : 'text-[#1E293B] hover:bg-white'
                  }`}
                >
                  Family View
                </button>
                <button
                  onClick={() => setUserRole('merchant')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    userRole === 'merchant' ? 'bg-[#2C5EAD] text-white' : 'text-[#1E293B] hover:bg-white'
                  }`}
                >
                  Merchant View
                </button>
              </div>
            )}

            <div className="flex items-center gap-4">
              {walletConnected && (
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Stellar Expert"
                  className="p-2 hover:bg-[#EFF6FF] rounded-2xl transition-colors"
                >
                  <Globe size={20} className="text-[#64748B]" />
                </a>
              )}

              {walletConnected && (
                <button className="p-2 hover:bg-[#EFF6FF] rounded-2xl transition-colors relative">
                  <Bell size={20} className="text-[#64748B]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
                </button>
              )}

              {walletConnected ? (
                <div className="relative flex items-center gap-2">
                  <div
                    title="Native XLM balance (testnet)"
                    className="hidden sm:flex items-center gap-1 px-3 py-2 bg-[#EFF6FF] rounded-2xl text-sm font-mono text-[#2C5EAD]"
                  >
                    {isBalanceLoading ? '…' : `${formatXlm(xlmBalance)} XLM`}
                  </div>
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2C5EAD] text-white rounded-2xl hover:bg-[#1591DC] transition-colors"
                  >
                    <User size={16} />
                    <span className="font-mono text-sm">{walletAddress}</span>
                    <ChevronDown size={16} />
                  </button>

                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#E2E8F0] py-1">
                      <button
                        onClick={() => {
                          copyToClipboard(walletAddress);
                          setShowWalletMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#EFF6FF] text-[#1E293B]"
                      >
                        Copy Address
                      </button>
                      <button
                        onClick={() => {
                          setShowRoleModal(true);
                          setShowWalletMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#EFF6FF] text-[#1E293B]"
                      >
                        Switch Role
                      </button>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setShowWalletMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#EFF6FF] text-[#EF4444]"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <Button onClick={handleConnect} disabled={connecting} className="text-sm px-3 py-2 sm:px-4">
                    {connecting ? 'Connecting…' : (
                      <>
                        <span className="hidden sm:inline">Connect Wallet</span>
                        <span className="sm:hidden">Connect Wallet</span>
                      </>
                    )}
                  </Button>
                  {walletError && (
                    <span className="text-xs text-red-500 max-w-xs text-right">{walletError}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-6 text-center">Who are you?</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setUserRole('ofw');
                  setShowRoleModal(false);
                }}
                className="p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#1591DC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B]">OFW Sender</h3>
                  <p className="text-sm text-[#64748B] text-center">I send money home</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setUserRole('family');
                  setShowRoleModal(false);
                }}
                className="p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#1591DC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B]">Family Receiver</h3>
                  <p className="text-sm text-[#64748B] text-center">I receive money from abroad</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setUserRole('merchant');
                  setShowRoleModal(false);
                }}
                className="p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#1591DC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package size={32} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B]">Merchant Partner</h3>
                  <p className="text-sm text-[#64748B] text-center">I offer perks to OFW families</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-6 w-full py-2 text-[#64748B] hover:text-[#1E293B]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

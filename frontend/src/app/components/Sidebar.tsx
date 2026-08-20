import { Home, Send, Package, History, Settings, QrCode, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

function formatXlm(balance: string): string {
  const n = Number(balance);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : balance;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { userRole, walletAddress, disconnectWallet, xlmBalance, isBalanceLoading } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['ofw', 'family', 'merchant'] },
    { id: 'send', label: 'Send Money', icon: Send, roles: ['ofw'] },
    { id: 'wallet', label: 'Send XLM (Testnet)', icon: Wallet, roles: ['ofw', 'family', 'merchant'] },
    { id: 'boxes', label: 'My Boxes', icon: Package, roles: ['ofw', 'family'] },
    { id: 'history', label: 'Transaction History', icon: History, roles: ['ofw', 'family'] },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode, roles: ['merchant'] }
  ];

  const visibleNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white border-r border-[#E2E8F0]">
      <div className="flex flex-col flex-1 pt-20">
        <nav className="flex-1 px-4 space-y-1">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'dashboard' && (currentPage === 'landing' || !currentPage));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all
                  ${isActive
                    ? 'bg-[#EFF6FF] text-[#1591DC]'
                    : 'text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1E293B]'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-[#E2E8F0]">
          <div className="space-y-3">
            <div className="px-4 py-2 bg-[#EFF6FF] rounded-2xl">
              <p className="text-xs text-[#64748B] mb-1">Connected Wallet</p>
              <p className="font-mono text-sm text-[#1E293B] truncate">{walletAddress}</p>
              <p className="text-xs text-[#64748B] mt-2 mb-1">XLM Balance (testnet)</p>
              <p className="font-mono text-sm font-semibold text-[#2C5EAD]">
                {isBalanceLoading ? 'Loading…' : `${formatXlm(xlmBalance)} XLM`}
              </p>
            </div>
            <button
              onClick={disconnectWallet}
              className="w-full px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 rounded-2xl transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

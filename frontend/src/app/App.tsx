import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { OFWDashboard } from './pages/OFWDashboard';
import { SendMoneyWizard } from './pages/SendMoneyWizard';
import { SendXlm } from './pages/SendXlm';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { NFTCollection } from './pages/NFTCollection';
import { TransactionHistory } from './pages/TransactionHistory';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { Home, Send, Package, History } from 'lucide-react';

function AppContent() {
  const { walletConnected, userRole } = useApp();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (!walletConnected || !userRole) {
      return <LandingPage />;
    }

    if (currentPage === 'send') {
      return <SendMoneyWizard onNavigate={handleNavigate} />;
    }

    if (currentPage === 'wallet') {
      return <SendXlm onNavigate={handleNavigate} />;
    }

    if (currentPage === 'boxes') {
      return <NFTCollection onNavigate={handleNavigate} />;
    }

    if (currentPage === 'history') {
      return <TransactionHistory />;
    }

    if (userRole === 'ofw') {
      return <OFWDashboard onNavigate={handleNavigate} />;
    }

    if (userRole === 'family') {
      return <FamilyDashboard />;
    }

    if (userRole === 'merchant') {
      return <MerchantDashboard />;
    }

    return <LandingPage />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <OfflineBanner />
      <Navbar />

      {walletConnected && userRole && (
        <>
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  currentPage === 'dashboard' || currentPage === 'landing' ? 'text-[#1591DC]' : 'text-[#64748B]'
                }`}
              >
                <Home size={20} />
                <span className="text-xs">Home</span>
              </button>

              {userRole === 'ofw' && (
                <button
                  onClick={() => setCurrentPage('send')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 ${
                    currentPage === 'send' ? 'text-[#1591DC]' : 'text-[#64748B]'
                  }`}
                >
                  <Send size={20} />
                  <span className="text-xs">Send</span>
                </button>
              )}

              <button
                onClick={() => setCurrentPage('boxes')}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  currentPage === 'boxes' ? 'text-[#1591DC]' : 'text-[#64748B]'
                }`}
              >
                <Package size={20} />
                <span className="text-xs">Boxes</span>
              </button>

              <button
                onClick={() => setCurrentPage('history')}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  currentPage === 'history' ? 'text-[#1591DC]' : 'text-[#64748B]'
                }`}
              >
                <History size={20} />
                <span className="text-xs">History</span>
              </button>
            </div>
          </div>
        </>
      )}

      <main className={walletConnected && userRole ? 'pb-20 md:pb-0 lg:pl-64' : ''}>
        {renderPage()}
      </main>

      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
      <Analytics />
      <SpeedInsights />
    </AppProvider>
  );
}

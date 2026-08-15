import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-amber-500 text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-2 pointer-events-auto">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold">You are offline. Some features may be unavailable.</span>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Package, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  const install = async () => {
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-white rounded-2xl border border-[#C4E2F5] shadow-2xl shadow-blue-100 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2C5EAD] to-[#4BB8FA] flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1E293B]">Install BalikBayan</p>
          <p className="text-xs text-[#64748B] truncate">Add to home screen for quick access</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="px-3 py-1.5 rounded-xl bg-[#2C5EAD] text-white text-xs font-bold hover:bg-[#1591DC] transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl hover:bg-[#EFF6FF] transition-colors"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
      </div>
    </div>
  );
}

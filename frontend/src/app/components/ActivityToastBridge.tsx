import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';

// Surfaces the event-driven state sync from AppContext (see
// watchWalletActivity in utils/eventService.ts) as a toast, so on-chain
// activity detected via Soroban RPC event polling is visible anywhere in
// the app, not just on the page that triggered the transaction.
export function ActivityToastBridge() {
  const { lastActivityEvent, walletAddress } = useApp();
  const { showToast } = useToast();
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    if (!lastActivityEvent || seenIds.current.has(lastActivityEvent.id)) return;
    seenIds.current.add(lastActivityEvent.id);

    const direction = lastActivityEvent.to === walletAddress ? 'received' : 'sent';
    showToast('info', `On-chain activity detected: funds ${direction} (ledger ${lastActivityEvent.ledger})`);
  }, [lastActivityEvent, walletAddress, showToast]);

  return null;
}

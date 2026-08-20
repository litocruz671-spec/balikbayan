import { rpc as SorobanRpc, scValToNative } from '@stellar/stellar-sdk';
import { RPC_URL, TOKEN_CONTRACT_ID } from './sorobanConfig';

// Real-time-ish state sync (Level 2 requirement) via Soroban RPC event
// polling. The escrow contract itself doesn't publish custom events, but
// every create_escrow/confirm_payment/claim_refund call moves funds through
// TOKEN_CONTRACT_ID (the SAC), which does emit a standard "transfer" event —
// so watching that contract's events for the connected address is how the
// app detects on-chain activity (escrow funded, payment released) without
// the user manually hitting refresh.

const server = new SorobanRpc.Server(RPC_URL);

export interface WalletActivityEvent {
  id: string;
  ledger: number;
  txHash: string;
  kind: string;
  from?: string;
  to?: string;
  amount?: string;
}

function parseEvent(e: SorobanRpc.Api.EventResponse): WalletActivityEvent | null {
  try {
    const topics = e.topic.map(t => scValToNative(t));
    return {
      id: e.id,
      ledger: e.ledger,
      txHash: e.txHash,
      kind: String(topics[0] ?? ''),
      from: topics[1] !== undefined ? String(topics[1]) : undefined,
      to: topics[2] !== undefined ? String(topics[2]) : undefined,
      amount: e.value ? String(scValToNative(e.value)) : undefined,
    };
  } catch {
    // Not every event on this contract is a simple transfer (mint/clawback/etc
    // have different topic shapes) — skip anything we can't cleanly parse.
    return null;
  }
}

/**
 * Polls Soroban RPC for token-transfer events involving `address` (as sender
 * or receiver) and invokes `onActivity` for each one. Returns an unsubscribe
 * function to stop polling.
 */
export function watchWalletActivity(
  address: string,
  onActivity: (event: WalletActivityEvent) => void,
  pollMs = 12000
): () => void {
  let cancelled = false;
  let cursor: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const poll = async () => {
    if (cancelled) return;
    try {
      let request: Parameters<typeof server.getEvents>[0];
      if (cursor) {
        request = { filters: [{ type: 'contract', contractIds: [TOKEN_CONTRACT_ID] }], cursor, limit: 20 };
      } else {
        // First poll: look back a short window instead of from ledger 1, both
        // to stay inside the RPC's event-retention window and to avoid
        // replaying the wallet's entire history as "new" activity.
        const { sequence } = await server.getLatestLedger();
        request = {
          filters: [{ type: 'contract', contractIds: [TOKEN_CONTRACT_ID] }],
          startLedger: Math.max(1, sequence - 100),
          limit: 20,
        };
      }

      const response = await server.getEvents(request);
      for (const raw of response.events) {
        const parsed = parseEvent(raw);
        if (parsed && parsed.kind === 'transfer' && (parsed.from === address || parsed.to === address)) {
          onActivity(parsed);
        }
      }
      cursor = response.cursor;
    } catch (err) {
      console.error('Event poll failed:', err);
    } finally {
      if (!cancelled) timer = setTimeout(poll, pollMs);
    }
  };

  poll();
  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}

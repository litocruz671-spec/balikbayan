// Shared classification for the wallet/transaction failure modes the app
// needs to distinguish in the UI: a wallet that isn't installed/available, a
// signature the user rejected in their wallet, and a transaction the account
// can't afford. Used by both the wallet-connect flow (walletKit.ts) and every
// transaction-signing flow (contractService.ts, xlmService.ts) so the same
// three error types are always described the same way to the user.

export type WalletErrorKind = 'not-found' | 'rejected' | 'insufficient-balance' | 'unknown';

export interface DescribedError {
  kind: WalletErrorKind;
  message: string;
}

export function describeWalletError(err: unknown): DescribedError {
  const raw = err instanceof Error ? err.message : String(err);

  if (/not installed|not found|no wallet|unavailable|extension/i.test(raw)) {
    return {
      kind: 'not-found',
      message: 'That wallet isn’t installed or available. Install it and try again.',
    };
  }
  if (/reject|denied|declin|cancel|user closed/i.test(raw)) {
    return {
      kind: 'rejected',
      message: 'Request was rejected in your wallet.',
    };
  }
  if (/underfunded|insufficient|not enough balance|below.{0,10}reserve/i.test(raw)) {
    return {
      kind: 'insufficient-balance',
      message: 'Insufficient balance to complete this transaction.',
    };
  }
  return { kind: 'unknown', message: raw || 'Something went wrong. Please try again.' };
}

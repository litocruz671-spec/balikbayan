import { Asset, Networks } from '@stellar/stellar-sdk';

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? '';

// Defaults to the native XLM Stellar Asset Contract so escrows need no
// trustline or funding step beyond the account's own XLM balance.
export const TOKEN_CONTRACT_ID =
  import.meta.env.VITE_TOKEN_CONTRACT_ID ?? Asset.native().contractId(NETWORK_PASSPHRASE);

// True only when the contract has been deployed and VITE_CONTRACT_ID is set
export const CONTRACT_READY = CONTRACT_ID.length > 0;

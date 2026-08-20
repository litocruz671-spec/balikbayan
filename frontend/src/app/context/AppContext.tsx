import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StrKey, MuxedAccount } from '@stellar/stellar-sdk';
import { TierType } from '../components/NFTBoxCard';
import { BillType } from '../components/BillTypeIcon';
import { CONTRACT_READY } from '../utils/sorobanConfig';
import * as contractService from '../utils/contractService';
import { getXlmBalance } from '../utils/xlmService';
import { openWalletModal, kitDisconnect, getSelectedWalletName } from '../utils/walletKit';
import { describeWalletError } from '../utils/errors';
import { watchWalletActivity, WalletActivityEvent } from '../utils/eventService';

/**
 * Normalize any Stellar address to a plain G... Ed25519 public key.
 * Freighter can return muxed (M...) addresses — we extract the base key.
 * C... addresses from Freighter indicate a muxed key encoded differently;
 * we guard against those too by falling back to the raw value.
 */
function normalizeToGAddress(addr: string): string {
  if (!addr) return addr;
  // Muxed account (M...) — extract base G-address
  if (addr.startsWith('M') && StrKey.isValidMed25519PublicKey(addr)) {
    try {
      const muxed = MuxedAccount.fromAddress(addr, '0');
      return muxed.baseAccount().accountId();
    } catch {
      // fall through
    }
  }
  // Already a valid G-address
  if (StrKey.isValidEd25519PublicKey(addr)) return addr;
  // Unknown format — return as-is, let downstream validation catch it
  return addr;
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), ms)),
  ]);
}

export type UserRole = 'ofw' | 'family' | 'merchant' | null;
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export interface Escrow {
  id: string;
  onChainId?: number;
  recipientAddress: string;
  recipientName: string;
  amount: number;
  billType: BillType;
  billDetails: Record<string, string>;
  status: 'locked' | 'pending' | 'fulfilled' | 'expired' | 'disputed';
  deadline: string;
  createdAt: string;
  proofImage?: string;
}

export interface NFTBox {
  id: string;
  boxNumber: number;
  amount: number;
  date: string;
  tier: TierType;
  billType: BillType;
  transactionHash: string;
  countryFlag: string;
}

interface AppContextValue {
  walletConnected: boolean;
  walletAddress: string;
  walletName: string | null;
  walletError: string | null;
  userRole: UserRole;
  contractReady: boolean;
  isChainLoading: boolean;
  xlmBalance: string;
  isBalanceLoading: boolean;
  refreshXlmBalance: () => Promise<void>;
  lastActivityEvent: WalletActivityEvent | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  txStatus: TxStatus;
  txMessage: string;
  clearTxStatus: () => void;
  setUserRole: (role: UserRole) => void;
  escrows: Escrow[];
  addEscrow: (escrow: Escrow) => void;
  updateEscrow: (id: string, updates: Partial<Escrow>) => void;
  createEscrowOnChain: (params: {
    recipientAddress: string;
    recipientName: string;
    amount: number;
    billType: BillType;
    billDetails: Record<string, string>;
    deadline: string;
  }) => Promise<void>;
  confirmPaymentOnChain: (escrowId: string) => Promise<void>;
  claimRefundOnChain: (escrowId: string) => Promise<void>;
  raiseDisputeOnChain: (escrowId: string) => Promise<void>;
  refreshFromChain: () => Promise<void>;
  nftBoxes: NFTBox[];
  addNFTBox: (box: NFTBox) => void;
  currentTier: TierType;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function loadPersistedEscrows(): Escrow[] {
  try {
    const raw = localStorage.getItem('balikbayan_escrows');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistEscrows(escrows: Escrow[]) {
  localStorage.setItem('balikbayan_escrows', JSON.stringify(escrows));
}

function computeTier(boxCount: number): TierType {
  if (boxCount >= 60) return 'legend';
  if (boxCount >= 24) return 'diamond';
  if (boxCount >= 12) return 'gold';
  if (boxCount >= 5) return 'silver';
  return 'common';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [escrows, setEscrows] = useState<Escrow[]>(loadPersistedEscrows);
  const [nftBoxes, setNFTBoxes] = useState<NFTBox[]>([]);
  const [isChainLoading, setIsChainLoading] = useState(false);
  const [xlmBalance, setXlmBalance] = useState('0');
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txMessage, setTxMessage] = useState('');
  const [lastActivityEvent, setLastActivityEvent] = useState<WalletActivityEvent | null>(null);

  const clearTxStatus = () => {
    setTxStatus('idle');
    setTxMessage('');
  };

  // Wraps an on-chain action with visible pending/success/error status,
  // classified via describeWalletError into the 3 failure types the app
  // needs to distinguish (wallet not found, rejected, insufficient balance).
  const withTxStatus = async <T,>(pendingMessage: string, successMessage: string, action: () => Promise<T>): Promise<T> => {
    setTxStatus('pending');
    setTxMessage(pendingMessage);
    try {
      const result = await action();
      setTxStatus('success');
      setTxMessage(successMessage);
      return result;
    } catch (err) {
      const described = describeWalletError(err);
      setTxStatus('error');
      setTxMessage(described.message);
      throw err;
    }
  };

  const refreshXlmBalance = useCallback(async (address?: string) => {
    const addr = address ?? walletAddress;
    if (!addr) return;

    setIsBalanceLoading(true);
    try {
      const balance = await getXlmBalance(addr);
      setXlmBalance(balance);
    } catch (err) {
      console.error('Failed to fetch XLM balance:', err);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [walletAddress]);

  const refreshFromChain = useCallback(async (address?: string) => {
    const addr = address ?? walletAddress;
    if (!addr || !CONTRACT_READY) return;

    setIsChainLoading(true);
    try {
      const chainBoxes = await contractService.loadAllBoxes(addr);

      const boxes: NFTBox[] = chainBoxes.map(b => ({
        id: `box-${b.boxNumber}`,
        boxNumber: b.boxNumber,
        amount: b.amountPhp,
        date: new Date(b.timestamp * 1000).toLocaleDateString(),
        tier: computeTier(b.boxNumber),
        billType: b.billType as BillType,
        transactionHash: '',
        countryFlag: '🇵🇭',
      }));

      setNFTBoxes(boxes);

      // Refresh statuses of locally-persisted escrows from chain
      const stored = loadPersistedEscrows().filter(
        e => e.recipientAddress === addr || e.onChainId !== undefined
      );

      const refreshed = await Promise.all(
        stored.map(async e => {
          if (!e.onChainId) return e;
          const chain = await contractService.getEscrow(addr, e.onChainId);
          if (!chain) return e;
          return { ...e, status: chain.status };
        })
      );

      setEscrows(refreshed);
      persistEscrows(refreshed);
    } catch (err) {
      console.error('Failed to load chain data:', err);
    } finally {
      setIsChainLoading(false);
    }
  }, [walletAddress]);

  // Real-time-ish state sync: watch Soroban RPC for token-transfer events
  // touching the connected wallet (escrow funded, payment released, refund
  // paid out, plain XLM sends) and refresh chain state + balance whenever
  // one lands, instead of requiring a manual refresh.
  useEffect(() => {
    if (!walletConnected || !walletAddress) return;

    const unsubscribe = watchWalletActivity(walletAddress, (event) => {
      setLastActivityEvent(event);
      refreshFromChain(walletAddress);
      refreshXlmBalance(walletAddress);
    });

    return unsubscribe;
  }, [walletConnected, walletAddress, refreshFromChain, refreshXlmBalance]);

  const connectWallet = async () => {
    setWalletError(null);
    try {
      // Opens StellarWalletsKit's picker modal — the user chooses among
      // Freighter, xBull, Albedo, Rabet, Lobstr, or Hana. A locked/unresponsive
      // extension would otherwise hang this forever with no popup and no error,
      // hence the timeout.
      const { address: rawAddr } = await withTimeout(
        openWalletModal(),
        60000,
        'Wallet did not respond. Make sure it’s unlocked and try again.'
      );

      const addr = normalizeToGAddress(rawAddr);

      if (!addr || !StrKey.isValidEd25519PublicKey(addr)) {
        const msg = rawAddr
          ? `Unsupported address format returned by wallet: "${rawAddr}". Please switch to a standard G... account.`
          : 'Could not get address. Unlock your wallet and try again.';
        setWalletError(msg);
        throw new Error(msg);
      }
      setWalletAddress(addr);
      setWalletName(getSelectedWalletName() ?? null);
      setWalletConnected(true);

      // Load persisted escrows for this wallet
      const all = loadPersistedEscrows();
      setEscrows(all);

      // Hydrate from chain in background
      refreshFromChain(addr);
      refreshXlmBalance(addr);
    } catch (err) {
      const described = describeWalletError(err);
      setWalletError(described.message);
    }
  };

  const disconnectWallet = () => {
    kitDisconnect().catch(() => { /* best-effort; local state is cleared regardless */ });
    setWalletConnected(false);
    setWalletAddress('');
    setWalletName(null);
    setWalletError(null);
    setUserRole(null);
    setNFTBoxes([]);
    setXlmBalance('0');
    clearTxStatus();
  };

  const addEscrow = (escrow: Escrow) => {
    setEscrows(prev => {
      const next = [...prev, escrow];
      persistEscrows(next);
      return next;
    });
  };

  const updateEscrow = (id: string, updates: Partial<Escrow>) => {
    setEscrows(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      persistEscrows(next);
      return next;
    });
  };

  const createEscrowOnChain = async (params: {
    recipientAddress: string;
    recipientName: string;
    amount: number;
    billType: BillType;
    billDetails: Record<string, string>;
    deadline: string;
  }) => {
    const escrowId = await withTxStatus(
      'Signing and locking funds on Stellar…',
      'Promise locked on Stellar blockchain!',
      () => contractService.createEscrow(
        walletAddress,
        params.recipientAddress,
        params.amount,
        params.billType,
        params.deadline
      )
    );

    const escrow: Escrow = {
      id: `escrow-${escrowId}-${Date.now()}`,
      onChainId: escrowId,
      recipientAddress: params.recipientAddress,
      recipientName: params.recipientName,
      amount: params.amount,
      billType: params.billType,
      billDetails: params.billDetails,
      status: 'locked',
      deadline: params.deadline,
      createdAt: new Date().toISOString(),
    };

    addEscrow(escrow);
  };

  const confirmPaymentOnChain = async (localEscrowId: string) => {
    const escrow = escrows.find(e => e.id === localEscrowId);
    if (!escrow?.onChainId) throw new Error('Escrow has no on-chain ID');

    await withTxStatus(
      'Signing and confirming payment on Stellar…',
      'Payment confirmed — funds released!',
      () => contractService.confirmPayment(walletAddress, escrow.onChainId!)
    );
    updateEscrow(localEscrowId, { status: 'fulfilled' });

    // Refresh boxes since a new one gets minted on confirm_payment
    await refreshFromChain();
  };

  const claimRefundOnChain = async (localEscrowId: string) => {
    const escrow = escrows.find(e => e.id === localEscrowId);
    if (!escrow?.onChainId) throw new Error('Escrow has no on-chain ID');

    await withTxStatus(
      'Signing refund transaction…',
      'Refund claimed.',
      () => contractService.claimRefund(walletAddress, escrow.onChainId!)
    );
    updateEscrow(localEscrowId, { status: 'expired' });
  };

  const raiseDisputeOnChain = async (localEscrowId: string) => {
    const escrow = escrows.find(e => e.id === localEscrowId);
    if (!escrow?.onChainId) throw new Error('Escrow has no on-chain ID');

    await withTxStatus(
      'Signing dispute transaction…',
      'Dispute raised.',
      () => contractService.raiseDispute(walletAddress, escrow.onChainId!)
    );
    updateEscrow(localEscrowId, { status: 'disputed' });
  };

  const addNFTBox = (box: NFTBox) => {
    setNFTBoxes(prev => [...prev, box]);
  };

  const getCurrentTier = (): TierType => computeTier(nftBoxes.length);

  return (
    <AppContext.Provider value={{
      walletConnected,
      walletAddress,
      walletName,
      walletError,
      userRole,
      contractReady: CONTRACT_READY,
      isChainLoading,
      xlmBalance,
      isBalanceLoading,
      refreshXlmBalance,
      lastActivityEvent,
      connectWallet,
      disconnectWallet,
      txStatus,
      txMessage,
      clearTxStatus,
      setUserRole,
      escrows,
      addEscrow,
      updateEscrow,
      createEscrowOnChain,
      confirmPaymentOnChain,
      claimRefundOnChain,
      raiseDisputeOnChain,
      refreshFromChain,
      nftBoxes,
      addNFTBox,
      currentTier: getCurrentTier(),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
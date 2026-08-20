import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import { StrKey, MuxedAccount } from '@stellar/stellar-sdk';
import { TierType } from '../components/NFTBoxCard';
import { BillType } from '../components/BillTypeIcon';
import { CONTRACT_READY } from '../utils/sorobanConfig';
import * as contractService from '../utils/contractService';
import { getXlmBalance } from '../utils/xlmService';

/**
 * Normalize any Stellar address to a plain G... Ed25519 public key.
 * Freighter can return muxed (M...) addresses — we extract the base key.
 * C... addresses from Freighter indicate a muxed key encoded differently;
 * we guard against those too by falling back to the raw value.
 */
function normalizeToGAddress(addr: string): string {
  if (!addr) return addr;
  // Muxed account (M...) — extract base G-address
  if (addr.startsWith('M') && StrKey.isValidMuxedAccount(addr)) {
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
  walletError: string | null;
  userRole: UserRole;
  contractReady: boolean;
  isChainLoading: boolean;
  xlmBalance: string;
  isBalanceLoading: boolean;
  refreshXlmBalance: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
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
  const [walletError, setWalletError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [escrows, setEscrows] = useState<Escrow[]>(loadPersistedEscrows);
  const [nftBoxes, setNFTBoxes] = useState<NFTBox[]>([]);
  const [isChainLoading, setIsChainLoading] = useState(false);
  const [xlmBalance, setXlmBalance] = useState('0');
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

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

  const connectWallet = async () => {
    setWalletError(null);
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        const msg = 'Freighter not found. Install the Freighter extension at freighter.app';
        setWalletError(msg);
        throw new Error(msg);
      }

      // Always call requestAccess — opens Freighter popup if needed, returns address.
      // Freighter's requestAccess has no internal timeout, so a locked/unresponsive
      // extension would otherwise hang this forever with no popup and no error.
      const accessResult = await withTimeout(
        requestAccess(),
        15000,
        'Freighter did not respond. Make sure the extension is unlocked and try again.'
      );
      if (accessResult.error) {
        const msg = accessResult.error.message ?? 'Access denied by Freighter.';
        setWalletError(msg);
        throw new Error(msg);
      }

      const addressResult = await getAddress();
      const rawAddr = addressResult.error ? '' : addressResult.address;
      const addr = normalizeToGAddress(rawAddr);

      if (!addr || !StrKey.isValidEd25519PublicKey(addr)) {
        const msg = rawAddr
          ? `Unsupported address format returned by Freighter: "${rawAddr}". Please switch to a standard G... account in Freighter.`
          : 'Could not get address. Open Freighter, log in, and try again.';
        setWalletError(msg);
        throw new Error(msg);
      }
      setWalletAddress(addr);
      setWalletConnected(true);

      // Load persisted escrows for this wallet
      const all = loadPersistedEscrows();
      setEscrows(all);

      // Hydrate from chain in background
      refreshFromChain(addr);
      refreshXlmBalance(addr);
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Failed to connect wallet.');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletError(null);
    setUserRole(null);
    setNFTBoxes([]);
    setXlmBalance('0');
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
    const escrowId = await contractService.createEscrow(
      walletAddress,
      params.recipientAddress,
      params.amount,
      params.billType,
      params.deadline
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

    await contractService.confirmPayment(walletAddress, escrow.onChainId);
    updateEscrow(localEscrowId, { status: 'fulfilled' });

    // Refresh boxes since a new one gets minted on confirm_payment
    await refreshFromChain();
  };

  const claimRefundOnChain = async (localEscrowId: string) => {
    const escrow = escrows.find(e => e.id === localEscrowId);
    if (!escrow?.onChainId) throw new Error('Escrow has no on-chain ID');

    await contractService.claimRefund(walletAddress, escrow.onChainId);
    updateEscrow(localEscrowId, { status: 'expired' });
  };

  const raiseDisputeOnChain = async (localEscrowId: string) => {
    const escrow = escrows.find(e => e.id === localEscrowId);
    if (!escrow?.onChainId) throw new Error('Escrow has no on-chain ID');

    await contractService.raiseDispute(walletAddress, escrow.onChainId);
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
      walletError,
      userRole,
      contractReady: CONTRACT_READY,
      isChainLoading,
      xlmBalance,
      isBalanceLoading,
      refreshXlmBalance,
      connectWallet,
      disconnectWallet,
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
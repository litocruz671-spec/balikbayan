import {
  Asset,
  Contract,
  Horizon,
  Operation,
  TransactionBuilder,
  BASE_FEE,
  rpc as SorobanRpc,
  xdr,
  StrKey,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { kitSignTransaction } from './walletKit';
import { CONTRACT_ID, HORIZON_URL, NETWORK_PASSPHRASE, RPC_URL, TOKEN_CONTRACT_ID } from './sorobanConfig';
import { phpToTokenUnits, tokenUnitsToPHP } from './tokenMath';

export { phpToTokenUnits, tokenUnitsToPHP };

// Build ScVal for any Stellar address (G... account or C... contract)
function addressToScVal(address: string): xdr.ScVal {
  if (StrKey.isValidEd25519PublicKey(address)) {
    const bytes = StrKey.decodeEd25519PublicKey(address);
    return xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(bytes)
      )
    );
  }
  if (StrKey.isValidContract(address)) {
    const bytes = StrKey.decodeContract(address);
    return xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeContract(bytes as unknown as xdr.Hash)
    );
  }
  throw new Error(`Invalid Stellar address: "${address}". Must start with G (account) or C (contract).`);
}

const server = new SorobanRpc.Server(RPC_URL);
const horizon = new Horizon.Server(HORIZON_URL);

const BILL_TYPE_VARIANTS: Record<string, string> = {
  tuition: 'Tuition',
  electricity: 'Electricity',
  water: 'Water',
  internet: 'Internet',
  medical: 'Medical',
  rent: 'Rent',
  grocery: 'Grocery',
  medicine: 'Medicine',
  savings: 'Savings',
  custom: 'Custom',
};

const BILL_TYPE_FROM_CHAIN: Record<string, string> = Object.fromEntries(
  Object.entries(BILL_TYPE_VARIANTS).map(([k, v]) => [v, k])
);

function billTypeToScVal(billType: string): xdr.ScVal {
  const variant = BILL_TYPE_VARIANTS[billType] ?? 'Custom';
  return xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(variant)]);
}

function scValToBillType(val: xdr.ScVal): string {
  try {
    const arr = val.vec();
    if (arr && arr.length > 0) {
      const sym = arr[0].sym()?.toString();
      return BILL_TYPE_FROM_CHAIN[sym ?? ''] ?? 'custom';
    }
  } catch {
    // fall through
  }
  return 'custom';
}

async function buildAndSubmit(
  walletAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal | null> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(walletAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);

  const signResult = await kitSignTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: walletAddress,
  });

  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  );

  const sendResult = await server.sendTransaction(signedTx);

  if (sendResult.status === 'ERROR') {
    throw new Error('Transaction submission failed');
  }

  // Poll until confirmed
  let getResult = await server.getTransaction(sendResult.hash);
  let attempts = 0;
  while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 30) {
    await new Promise(r => setTimeout(r, 1000));
    getResult = await server.getTransaction(sendResult.hash);
    attempts++;
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    const success = getResult as SorobanRpc.Api.GetSuccessfulTransactionResponse;
    return success.returnValue ?? null;
  }

  throw new Error(`Transaction failed: ${getResult.status}`);
}

async function simulateOnContract(
  contractId: string,
  walletAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal | null> {
  const contract = new Contract(contractId);
  const account = await server.getAccount(walletAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`);
  }

  const success = simResult as SorobanRpc.Api.SimulateTransactionSuccessResponse;
  return success.result?.retval ?? null;
}

function simulateOnly(
  walletAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal | null> {
  return simulateOnContract(CONTRACT_ID, walletAddress, method, args);
}

// ── Trustlines ────────────────────────────────────────────────────────────────
// The escrow token (TOKEN_CONTRACT_ID) may be a Stellar Asset Contract
// wrapping a classic Stellar asset (e.g. USDC) or the native XLM SAC. Classic
// assets require the sending/receiving account to hold a trustline to the
// issuer before any transfer will succeed; native XLM never does. We detect
// which case applies by asking the SAC for its `name()`, which returns
// "<code>:<issuer>" for classic-asset-backed tokens and "native" for XLM.

let cachedTokenAsset: Asset | null | undefined;

async function getTokenAsset(walletAddress: string): Promise<Asset | null> {
  if (cachedTokenAsset !== undefined) return cachedTokenAsset;

  const result = await simulateOnContract(TOKEN_CONTRACT_ID, walletAddress, 'name', []);
  const name = result ? String(scValToNative(result)) : '';
  const [code, issuer] = name.split(':');

  cachedTokenAsset = code && issuer ? new Asset(code, issuer) : null;
  return cachedTokenAsset;
}

async function hasTrustline(walletAddress: string, asset: Asset): Promise<boolean> {
  const account = await horizon.loadAccount(walletAddress);
  return account.balances.some((b) => {
    const line = b as unknown as { asset_code?: string; asset_issuer?: string };
    return line.asset_code === asset.getCode() && line.asset_issuer === asset.getIssuer();
  });
}

// Ensures the wallet holds a trustline for the escrow token, prompting the
// user to sign a one-time ChangeTrust operation if it's missing. Returns
// true if a trustline was created, false if one already existed (or the
// token isn't a classic asset and doesn't need one).
export async function ensureTrustline(walletAddress: string): Promise<boolean> {
  const asset = await getTokenAsset(walletAddress);
  if (!asset) return false;

  if (await hasTrustline(walletAddress, asset)) return false;

  const account = await horizon.loadAccount(walletAddress);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(30)
    .build();

  const signResult = await kitSignTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: walletAddress,
  });

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
  await horizon.submitTransaction(signedTx);
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function assertAddress(addr: string, label: string) {
  if (!addr || addr.trim().length === 0) {
    throw new Error(`${label} address is empty. Make sure your wallet is connected.`);
  }
  const trimmed = addr.trim();
  if (trimmed.startsWith('M')) {
    throw new Error(
      `${label} address is a muxed account (starts with M). Please switch to a standard G... account in Freighter settings.`
    );
  }
  if (!/^[GC][A-Z2-7]{55}$/.test(trimmed)) {
    throw new Error(
      `${label} address is invalid: "${trimmed}". Must be a Stellar G... account address. ` +
      `If Freighter shows a different format, switch to a standard account in Freighter.`
    );
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createEscrow(
  walletAddress: string,
  familyAddress: string,
  amountPhp: number,
  billType: string,
  deadlineDate: string
): Promise<number> {
  assertAddress(walletAddress, 'Wallet');
  assertAddress(familyAddress, 'Recipient');
  assertAddress(TOKEN_CONTRACT_ID, 'Token');

  await ensureTrustline(walletAddress);

  const amount = phpToTokenUnits(amountPhp);
  const deadline = BigInt(Math.floor(new Date(deadlineDate).getTime() / 1000));

  const args = [
    addressToScVal(walletAddress),
    addressToScVal(familyAddress),
    addressToScVal(TOKEN_CONTRACT_ID),
    nativeToScVal(amount, { type: 'i128' }),
    billTypeToScVal(billType),
    nativeToScVal(deadline, { type: 'u64' }),
  ];

  const result = await buildAndSubmit(walletAddress, 'create_escrow', args);
  if (!result) throw new Error('No return value from create_escrow');
  return Number(scValToNative(result));
}

export async function confirmPayment(
  walletAddress: string,
  escrowId: number
): Promise<boolean> {
  assertAddress(walletAddress, 'Wallet');
  const args = [nativeToScVal(escrowId, { type: 'u32' })];
  const result = await buildAndSubmit(walletAddress, 'confirm_payment', args);
  return result ? Boolean(scValToNative(result)) : false;
}

export async function claimRefund(
  walletAddress: string,
  escrowId: number
): Promise<boolean> {
  const args = [nativeToScVal(escrowId, { type: 'u32' })];
  const result = await buildAndSubmit(walletAddress, 'claim_refund', args);
  return result ? Boolean(scValToNative(result)) : false;
}

export async function raiseDispute(
  walletAddress: string,
  escrowId: number
): Promise<boolean> {
  const args = [
    nativeToScVal(escrowId, { type: 'u32' }),
    addressToScVal(walletAddress),
  ];
  const result = await buildAndSubmit(walletAddress, 'raise_dispute', args);
  return result ? Boolean(scValToNative(result)) : false;
}

export interface ChainEscrow {
  onChainId: number;
  ofw: string;
  family: string;
  token: string;
  amountPhp: number;
  billType: string;
  deadline: string;
  status: 'locked' | 'fulfilled' | 'expired' | 'disputed';
  boxMinted: boolean;
}

export async function getEscrow(
  walletAddress: string,
  escrowId: number
): Promise<ChainEscrow | null> {
  try {
    const args = [nativeToScVal(escrowId, { type: 'u32' })];
    const result = await simulateOnly(walletAddress, 'get_escrow', args);
    if (!result) return null;

    const raw = scValToNative(result) as Record<string, unknown>;

    const statusMap: Record<string, ChainEscrow['status']> = {
      Active: 'locked',
      Fulfilled: 'fulfilled',
      Expired: 'expired',
      Disputed: 'disputed',
    };

    const statusRaw = result.map()?.find(e => e.key().sym()?.toString() === 'status');
    const statusStr = statusRaw
      ? statusRaw.val().vec()?.[0].sym()?.toString() ?? 'Active'
      : 'Active';

    const billTypeRaw = result.map()?.find(e => e.key().sym()?.toString() === 'bill_type');
    const billTypeStr = billTypeRaw ? scValToBillType(billTypeRaw.val()) : 'custom';

    return {
      onChainId: escrowId,
      ofw: String(raw.ofw ?? ''),
      family: String(raw.family ?? ''),
      token: String(raw.token ?? ''),
      amountPhp: tokenUnitsToPHP(BigInt(String(raw.amount ?? '0'))),
      billType: billTypeStr,
      deadline: new Date(Number(raw.deadline ?? 0) * 1000).toISOString(),
      status: statusMap[statusStr] ?? 'locked',
      boxMinted: Boolean(raw.box_minted),
    };
  } catch {
    return null;
  }
}

export interface ChainBox {
  boxNumber: number;
  amountPhp: number;
  timestamp: number;
  billType: string;
}

export async function getBoxCount(walletAddress: string): Promise<number> {
  try {
    const args = [addressToScVal(walletAddress)];
    const result = await simulateOnly(walletAddress, 'get_box_count', args);
    return result ? Number(scValToNative(result)) : 0;
  } catch {
    return 0;
  }
}

export async function getBox(
  walletAddress: string,
  boxNumber: number
): Promise<ChainBox | null> {
  try {
    const args = [
      addressToScVal(walletAddress),
      nativeToScVal(boxNumber, { type: 'u32' }),
    ];
    const result = await simulateOnly(walletAddress, 'get_box', args);
    if (!result) return null;

    const raw = scValToNative(result) as Record<string, unknown>;
    const billTypeRaw = result.map()?.find(e => e.key().sym()?.toString() === 'bill_type');
    const billTypeStr = billTypeRaw ? scValToBillType(billTypeRaw.val()) : 'custom';

    return {
      boxNumber,
      amountPhp: tokenUnitsToPHP(BigInt(String(raw.amount ?? '0'))),
      timestamp: Number(raw.timestamp ?? 0),
      billType: billTypeStr,
    };
  } catch {
    return null;
  }
}

export async function getTier(walletAddress: string): Promise<string> {
  try {
    const args = [addressToScVal(walletAddress)];
    const result = await simulateOnly(walletAddress, 'get_tier', args);
    return result ? String(scValToNative(result)) : 'Common';
  } catch {
    return 'Common';
  }
}

export async function loadAllBoxes(walletAddress: string): Promise<ChainBox[]> {
  const count = await getBoxCount(walletAddress);
  const boxes: ChainBox[] = [];
  for (let i = 1; i <= count; i++) {
    const box = await getBox(walletAddress, i);
    if (box) boxes.push(box);
  }
  return boxes;
}
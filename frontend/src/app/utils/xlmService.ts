import {
  Asset,
  Horizon,
  Operation,
  TransactionBuilder,
  BASE_FEE,
  Memo,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { HORIZON_URL, NETWORK_PASSPHRASE } from './sorobanConfig';

// Plain classic-Stellar XLM balance + payment helpers. Kept separate from
// contractService.ts (which drives the Soroban escrow contract) so a wallet's
// native XLM balance and a simple peer-to-peer XLM transfer work even before
// any contract is deployed — this is what Level 1 "White Belt" checks for.

const horizon = new Horizon.Server(HORIZON_URL);

/**
 * Fetches the connected wallet's native XLM balance from Horizon.
 * Returns '0' for an unfunded/not-yet-created testnet account instead of
 * throwing, since that's a normal state for a freshly generated wallet.
 */
export async function getXlmBalance(address: string): Promise<string> {
  try {
    const account = await horizon.loadAccount(address);
    const native = account.balances.find(b => b.asset_type === 'native');
    return native?.balance ?? '0';
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) return '0'; // account not funded on testnet yet
    throw err;
  }
}

export interface XlmPaymentResult {
  hash: string;
}

/**
 * Builds, signs (via Freighter), and submits a plain native-XLM payment —
 * a classic Operation.payment, not a Soroban contract invocation.
 */
export async function sendXlmPayment(
  source: string,
  destination: string,
  amount: string,
  memoText?: string
): Promise<XlmPaymentResult> {
  const account = await horizon.loadAccount(source);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount,
    })
  );

  if (memoText) builder.addMemo(Memo.text(memoText.slice(0, 28)));

  const tx = builder.setTimeout(30).build();

  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if ('error' in signResult && signResult.error) {
    throw new Error((signResult.error as Error).message ?? 'Signing rejected');
  }

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
  const submitResult = await horizon.submitTransaction(signedTx);

  return { hash: submitResult.hash };
}

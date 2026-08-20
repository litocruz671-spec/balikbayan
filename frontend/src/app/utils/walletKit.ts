import { StellarWalletsKit, Networks as KitNetworks, type ModuleInterface } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana';
import { NETWORK_PASSPHRASE } from './sorobanConfig';

// Multi-wallet support (Level 2 requirement) via StellarWalletsKit — replaces
// the previous Freighter-only integration. The kit's own modal lets the user
// pick from any of these; wallets that aren't installed still show up with
// an "install" link rather than being hidden, so the picker itself doubles
// as wallet discovery.
const KIT_NETWORK = NETWORK_PASSPHRASE === KitNetworks.TESTNET ? KitNetworks.TESTNET : KitNetworks.PUBLIC;

let initialized = false;

function ensureInit() {
  if (initialized) return;
  StellarWalletsKit.init({
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new AlbedoModule(),
      new RabetModule(),
      new LobstrModule(),
      new HanaModule(),
    ] as ModuleInterface[],
    network: KIT_NETWORK,
    authModal: { showInstallLabel: true },
  });
  initialized = true;
}

/** Opens the wallet-picker modal and returns the connected address. */
export async function openWalletModal(): Promise<{ address: string }> {
  ensureInit();
  return StellarWalletsKit.authModal();
}

export async function kitSignTransaction(
  xdr: string,
  opts: { networkPassphrase: string; address?: string }
): Promise<{ signedTxXdr: string }> {
  ensureInit();
  return StellarWalletsKit.signTransaction(xdr, opts);
}

export async function kitDisconnect(): Promise<void> {
  ensureInit();
  await StellarWalletsKit.disconnect();
}

/** Name of the currently selected wallet (e.g. "Freighter", "xBull"), if any. */
export function getSelectedWalletName(): string | undefined {
  if (!initialized) return undefined;
  try {
    return StellarWalletsKit.selectedModule?.productName;
  } catch {
    return undefined;
  }
}

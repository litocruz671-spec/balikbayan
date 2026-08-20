// PHP <-> token-unit conversion, pulled out of contractService.ts so this
// pure, deterministic math can be unit-tested without dragging in the RPC
// client and wallet-signing dependency chain.

// PHP to XLM conversion (7 decimal places on Stellar; fixed demo rate)
const PHP_TO_XLM = 56;
const TOKEN_DECIMALS = 10_000_000n;

export function phpToTokenUnits(php: number): bigint {
  return BigInt(Math.round((php / PHP_TO_XLM) * Number(TOKEN_DECIMALS)));
}

export function tokenUnitsToPHP(units: bigint): number {
  return (Number(units) / Number(TOKEN_DECIMALS)) * PHP_TO_XLM;
}

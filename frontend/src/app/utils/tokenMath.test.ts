import { describe, it, expect } from 'vitest';
import { phpToTokenUnits, tokenUnitsToPHP } from './tokenMath';

// PHP <-> token-unit conversion is pure and deterministic (everything else in
// contractService.ts needs a live RPC/wallet), so it's what's directly
// unit-testable without mocking the network.
describe('phpToTokenUnits / tokenUnitsToPHP', () => {
  it('round-trips a typical PHP amount without meaningful drift', () => {
    const units = phpToTokenUnits(200);
    const backToPhp = tokenUnitsToPHP(units);
    expect(backToPhp).toBeCloseTo(200, 0);
  });

  it('produces a positive bigint for a positive PHP amount', () => {
    const units = phpToTokenUnits(56);
    expect(units).toBeGreaterThan(0n);
  });

  it('maps 0 PHP to 0 units', () => {
    expect(phpToTokenUnits(0)).toBe(0n);
  });

  it('maps 0 units back to 0 PHP', () => {
    expect(tokenUnitsToPHP(0n)).toBe(0);
  });

  it('scales roughly linearly with amount', () => {
    const single = phpToTokenUnits(100);
    const double = phpToTokenUnits(200);
    // Allow small rounding drift from the integer bigint conversion.
    expect(Number(double)).toBeCloseTo(Number(single) * 2, -2);
  });
});

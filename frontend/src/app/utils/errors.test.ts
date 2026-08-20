import { describe, it, expect } from 'vitest';
import { describeWalletError } from './errors';

// Covers the 3 error types the app has to distinguish (Level 2 requirement):
// wallet not found, user-rejected signing, and insufficient balance — plus
// the unknown-error fallback.
describe('describeWalletError', () => {
  it('classifies a missing/uninstalled wallet', () => {
    const result = describeWalletError(new Error('Freighter is not installed'));
    expect(result.kind).toBe('not-found');
  });

  it('classifies a wallet extension being unavailable', () => {
    const result = describeWalletError(new Error('Wallet unavailable'));
    expect(result.kind).toBe('not-found');
  });

  it('classifies a user-rejected signature request', () => {
    const result = describeWalletError(new Error('User declined access'));
    expect(result.kind).toBe('rejected');
  });

  it('classifies a cancelled request as rejected', () => {
    const result = describeWalletError(new Error('User closed the popup'));
    expect(result.kind).toBe('rejected');
  });

  it('classifies an underfunded/insufficient-balance failure', () => {
    const result = describeWalletError(new Error('op_underfunded'));
    expect(result.kind).toBe('insufficient-balance');
  });

  it('classifies insufficient balance phrased in plain English', () => {
    const result = describeWalletError(new Error('Insufficient balance for this transaction'));
    expect(result.kind).toBe('insufficient-balance');
  });

  it('falls back to unknown for anything else, preserving the message', () => {
    const result = describeWalletError(new Error('Something exploded'));
    expect(result.kind).toBe('unknown');
    expect(result.message).toBe('Something exploded');
  });

  it('handles non-Error values without throwing', () => {
    const result = describeWalletError('a plain string error');
    expect(result.kind).toBe('unknown');
    expect(result.message).toBe('a plain string error');
  });
});

import { describe, expect, it } from 'vitest';
import { checkLicenceNumber } from '../licence';

describe('checkLicenceNumber', () => {
  it('returns EMPTY for an empty input', () => {
    expect(checkLicenceNumber('')).toBe('EMPTY');
  });

  it('returns EMPTY for a whitespace-only input', () => {
    expect(checkLicenceNumber('   ')).toBe('EMPTY');
  });

  it('returns NON_DIGITS for letters', () => {
    expect(checkLicenceNumber('1234567890abcd')).toBe('NON_DIGITS');
  });

  it('returns WRONG_LENGTH for 13 digits', () => {
    expect(checkLicenceNumber('1234567890123')).toBe('WRONG_LENGTH');
  });

  it('returns WRONG_LENGTH for 15 digits', () => {
    expect(checkLicenceNumber('123456789012345')).toBe('WRONG_LENGTH');
  });

  it('returns FORMAT_OK for exactly 14 digits', () => {
    expect(checkLicenceNumber('12345678901234')).toBe('FORMAT_OK');
  });

  it('returns FORMAT_OK for 14 digits with spaces', () => {
    expect(checkLicenceNumber('1234 5678 9012 34')).toBe('FORMAT_OK');
  });
});

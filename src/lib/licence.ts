export type LicenceCheck = 'EMPTY' | 'NON_DIGITS' | 'WRONG_LENGTH' | 'FORMAT_OK';

const LICENCE_LENGTH = 14;

/**
 * Checks only the shape of an FSSAI licence number: exactly 14 digits after
 * spaces are stripped. It does not confirm the licence is real or active.
 */
export function checkLicenceNumber(input: string): LicenceCheck {
  const digits = input.replace(/\s+/g, '');

  if (digits === '') {
    return 'EMPTY';
  }

  if (!/^\d+$/.test(digits)) {
    return 'NON_DIGITS';
  }

  if (digits.length !== LICENCE_LENGTH) {
    return 'WRONG_LENGTH';
  }

  return 'FORMAT_OK';
}

import { describe, expect, it } from 'vitest';
import {
  computeCheckDigit,
  detectBarcodeFormat,
  hasIndiaPrefix,
  isValidChecksum,
  normalizeBarcode,
  validateBarcode,
} from '../barcode';

describe('normalizeBarcode', () => {
  it('strips whitespace but keeps leading zeros', () => {
    expect(normalizeBarcode(' 4006 3813 3393 1 ')).toBe('4006381333931');
    expect(normalizeBarcode('036000291452')).toBe('036000291452');
  });
});

describe('detectBarcodeFormat', () => {
  it('detects 13, 12 and 8 digit formats', () => {
    expect(detectBarcodeFormat('4006381333931')).toBe('EAN13');
    expect(detectBarcodeFormat('036000291452')).toBe('UPCA');
    expect(detectBarcodeFormat('96385074')).toBe('EAN8');
  });

  it('returns null for unsupported lengths or non-digits', () => {
    expect(detectBarcodeFormat('12345')).toBeNull();
    expect(detectBarcodeFormat('400638133393X')).toBeNull();
  });
});

describe('computeCheckDigit', () => {
  it('computes the GTIN check digit', () => {
    expect(computeCheckDigit('400638133393')).toBe(1);
    expect(computeCheckDigit('9638507')).toBe(4);
    expect(computeCheckDigit('03600029145')).toBe(2);
  });
});

describe('isValidChecksum', () => {
  it('accepts valid EAN-13, EAN-8 and UPC-A', () => {
    expect(isValidChecksum('4006381333931')).toBe(true);
    expect(isValidChecksum('96385074')).toBe(true);
    expect(isValidChecksum('036000291452')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(isValidChecksum('4006381333932')).toBe(false);
    expect(isValidChecksum('96385075')).toBe(false);
  });
});

describe('hasIndiaPrefix', () => {
  it('flags the 890 GS1 India prefix as a hint only', () => {
    expect(hasIndiaPrefix('8901234567890')).toBe(true);
    expect(hasIndiaPrefix('4006381333931')).toBe(false);
  });
});

describe('validateBarcode', () => {
  it('accepts a valid EAN-13', () => {
    const result = validateBarcode('4006381333931');
    expect(result).toEqual({
      valid: true,
      barcode: '4006381333931',
      checks: { format: 'EAN13', checksumValid: true, prefixIndia: false },
    });
  });

  it('accepts a valid EAN-8', () => {
    const result = validateBarcode('96385074');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.checks.format).toBe('EAN8');
    }
  });

  it('accepts a valid UPC-A', () => {
    const result = validateBarcode('036000291452');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.checks.format).toBe('UPCA');
    }
  });

  it('accepts a valid EAN-13 with the India prefix', () => {
    const result = validateBarcode('8901234567890');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.checks.prefixIndia).toBe(true);
    }
  });

  it('rejects a bad checksum', () => {
    const result = validateBarcode('4006381333932');
    expect(result).toEqual({
      valid: false,
      code: 'INVALID_BARCODE',
      reason: 'CHECKSUM',
      message: 'Barcode check digit is not valid.',
    });
  });

  it('rejects letters', () => {
    const result = validateBarcode('40063813abcde');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('NON_DIGIT');
    }
  });

  it('rejects the wrong length', () => {
    const result = validateBarcode('12345');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('LENGTH');
      expect(result.message).toBe('Barcode must be 8, 12 or 13 digits.');
    }
  });

  it('rejects an empty or whitespace-only value', () => {
    expect(validateBarcode('').valid).toBe(false);
    expect(validateBarcode('   ').valid).toBe(false);
  });

  it('normalises surrounding whitespace before validating', () => {
    const result = validateBarcode(' 890 1234 5678 90 ');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.barcode).toBe('8901234567890');
    }
  });
});

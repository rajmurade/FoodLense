export type BarcodeFormat = 'EAN13' | 'EAN8' | 'UPCA';

export type BarcodeInvalidReason = 'NON_DIGIT' | 'LENGTH' | 'CHECKSUM';

export interface BarcodeChecks {
  format: BarcodeFormat;
  checksumValid: true;
  prefixIndia: boolean;
}

export type BarcodeValidation =
  | { valid: true; barcode: string; checks: BarcodeChecks }
  | {
      valid: false;
      code: 'INVALID_BARCODE';
      reason: BarcodeInvalidReason;
      message: string;
    };

const MESSAGES: Record<BarcodeInvalidReason, string> = {
  NON_DIGIT: 'Barcode must contain digits only.',
  LENGTH: 'Barcode must be 8, 12 or 13 digits.',
  CHECKSUM: 'Barcode check digit is not valid.',
};

export function normalizeBarcode(raw: string): string {
  return raw.replace(/\s+/g, '');
}

function isSupportedLength(barcode: string): boolean {
  return barcode.length === 8 || barcode.length === 12 || barcode.length === 13;
}

export function detectBarcodeFormat(barcode: string): BarcodeFormat | null {
  if (!/^\d+$/.test(barcode)) {
    return null;
  }
  if (barcode.length === 13) {
    return 'EAN13';
  }
  if (barcode.length === 12) {
    return 'UPCA';
  }
  if (barcode.length === 8) {
    return 'EAN8';
  }
  return null;
}

export function computeCheckDigit(payload: string): number {
  let sum = 0;
  let weight = 3;
  for (let i = payload.length - 1; i >= 0; i -= 1) {
    sum += Number(payload[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10;
}

export function isValidChecksum(barcode: string): boolean {
  if (!/^\d+$/.test(barcode) || !isSupportedLength(barcode)) {
    return false;
  }
  const payload = barcode.slice(0, -1);
  const checkDigit = Number(barcode[barcode.length - 1]);
  return computeCheckDigit(payload) === checkDigit;
}

export function hasIndiaPrefix(barcode: string): boolean {
  return barcode.startsWith('890');
}

function invalid(reason: BarcodeInvalidReason): BarcodeValidation {
  return { valid: false, code: 'INVALID_BARCODE', reason, message: MESSAGES[reason] };
}

export function validateBarcode(raw: string): BarcodeValidation {
  const barcode = normalizeBarcode(raw);

  if (!/^\d*$/.test(barcode)) {
    return invalid('NON_DIGIT');
  }

  if (!isSupportedLength(barcode)) {
    return invalid('LENGTH');
  }

  if (!isValidChecksum(barcode)) {
    return invalid('CHECKSUM');
  }

  const format = detectBarcodeFormat(barcode);

  if (!format) {
    return invalid('LENGTH');
  }

  return {
    valid: true,
    barcode,
    checks: {
      format,
      checksumValid: true,
      prefixIndia: hasIndiaPrefix(barcode),
    },
  };
}

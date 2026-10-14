import { describe, expect, it } from 'vitest';
import { checkCameraAvailability, confirmScan, SCAN_CONFIRMATION_READS } from '../scan';

describe('confirmScan', () => {
  it('requires two reads before confirming', () => {
    expect(SCAN_CONFIRMATION_READS).toBe(2);

    const first = confirmScan(null, '4006381333931');
    expect(first).toEqual({ confirmed: false, lastRead: '4006381333931' });

    const second = confirmScan(first.lastRead, '4006381333931');
    expect(second).toEqual({ confirmed: true, lastRead: '4006381333931' });
  });

  it('does not confirm when the next read differs', () => {
    const first = confirmScan(null, '4006381333931');
    const second = confirmScan(first.lastRead, '96385074');
    expect(second).toEqual({ confirmed: false, lastRead: '96385074' });
  });

  it('normalises whitespace so spaced and unspaced reads match', () => {
    const first = confirmScan(null, '4006 3813 3393 1');
    expect(first).toEqual({ confirmed: false, lastRead: '4006381333931' });

    const second = confirmScan(first.lastRead, '4006381333931');
    expect(second.confirmed).toBe(true);
  });

  it('never confirms when the previous read was null', () => {
    expect(confirmScan(null, '').confirmed).toBe(false);
  });
});

describe('checkCameraAvailability', () => {
  it('is available on a secure context with mediaDevices', () => {
    expect(checkCameraAvailability({ isSecureContext: true, hasMediaDevices: true })).toBe(
      'AVAILABLE',
    );
  });

  it('reports an insecure context before checking mediaDevices', () => {
    expect(checkCameraAvailability({ isSecureContext: false, hasMediaDevices: true })).toBe(
      'INSECURE_CONTEXT',
    );
  });

  it('reports unsupported when mediaDevices is missing', () => {
    expect(checkCameraAvailability({ isSecureContext: true, hasMediaDevices: false })).toBe(
      'UNSUPPORTED',
    );
  });
});

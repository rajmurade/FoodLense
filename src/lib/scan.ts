import { normalizeBarcode } from './barcode';

export const SCAN_CONFIRMATION_READS = 2;

export interface ScanConfirmation {
  confirmed: boolean;
  lastRead: string;
}

export function confirmScan(previousRead: string | null, nextRead: string): ScanConfirmation {
  const lastRead = normalizeBarcode(nextRead);
  return { confirmed: previousRead === lastRead, lastRead };
}

export type CameraAvailability = 'AVAILABLE' | 'INSECURE_CONTEXT' | 'UNSUPPORTED';

export interface CameraEnvironment {
  isSecureContext: boolean;
  hasMediaDevices: boolean;
}

export function checkCameraAvailability(env: CameraEnvironment): CameraAvailability {
  if (!env.isSecureContext) {
    return 'INSECURE_CONTEXT';
  }
  if (!env.hasMediaDevices) {
    return 'UNSUPPORTED';
  }
  return 'AVAILABLE';
}

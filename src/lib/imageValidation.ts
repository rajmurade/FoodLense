import { MAX_IMAGE_BYTES } from './constants';
import type { ImageType } from './constants';

export type ImageValidationErrorCode = 'EMPTY' | 'TOO_LARGE' | 'UNSUPPORTED_TYPE';

export type ImageValidationResult =
  | { ok: true; type: ImageType }
  | { ok: false; code: ImageValidationErrorCode };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function matches(bytes: Uint8Array, offset: number, expected: number[] | string): boolean {
  const length = expected.length;
  if (bytes.length < offset + length) {
    return false;
  }
  for (let i = 0; i < length; i += 1) {
    const value = typeof expected === 'string' ? expected.charCodeAt(i) : expected[i];
    if (bytes[offset + i] !== value) {
      return false;
    }
  }
  return true;
}

export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (matches(bytes, 0, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }
  if (matches(bytes, 0, PNG_SIGNATURE)) {
    return 'image/png';
  }
  if (matches(bytes, 0, 'RIFF') && matches(bytes, 8, 'WEBP')) {
    return 'image/webp';
  }
  return null;
}

export function validateImageFile(input: { size: number; bytes: Uint8Array }): ImageValidationResult {
  if (input.size <= 0) {
    return { ok: false, code: 'EMPTY' };
  }
  if (input.size > MAX_IMAGE_BYTES) {
    return { ok: false, code: 'TOO_LARGE' };
  }
  const type = detectImageType(input.bytes);
  if (!type) {
    return { ok: false, code: 'UNSUPPORTED_TYPE' };
  }
  return { ok: true, type };
}

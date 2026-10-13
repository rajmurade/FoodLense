import { describe, expect, it } from 'vitest';
import { detectImageType, validateImageFile } from '../imageValidation';
import { MAX_IMAGE_BYTES } from '../constants';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

describe('detectImageType', () => {
  it('detects JPEG by magic bytes', () => {
    expect(detectImageType(JPEG)).toBe('image/jpeg');
  });

  it('detects PNG by signature', () => {
    expect(detectImageType(PNG)).toBe('image/png');
  });

  it('detects WebP by RIFF/WEBP markers', () => {
    expect(detectImageType(WEBP)).toBe('image/webp');
  });

  it('rejects GIF', () => {
    expect(detectImageType(GIF)).toBeNull();
  });

  it('rejects empty and unknown bytes', () => {
    expect(detectImageType(new Uint8Array([]))).toBeNull();
    expect(detectImageType(new Uint8Array([0x00, 0x01, 0x02]))).toBeNull();
  });

  it('does not detect WebP when the WEBP marker is missing', () => {
    const riffNotWebp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20,
    ]);
    expect(detectImageType(riffNotWebp)).toBeNull();
  });
});

describe('validateImageFile', () => {
  it('accepts a supported image within the size limit', () => {
    expect(validateImageFile({ size: 1024, bytes: JPEG })).toEqual({
      ok: true,
      type: 'image/jpeg',
    });
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validateImageFile({ size: MAX_IMAGE_BYTES, bytes: PNG })).toEqual({
      ok: true,
      type: 'image/png',
    });
  });

  it('rejects an empty file', () => {
    expect(validateImageFile({ size: 0, bytes: new Uint8Array([]) })).toEqual({
      ok: false,
      code: 'EMPTY',
    });
  });

  it('rejects a file larger than the limit even if the type is supported', () => {
    expect(validateImageFile({ size: MAX_IMAGE_BYTES + 1, bytes: JPEG })).toEqual({
      ok: false,
      code: 'TOO_LARGE',
    });
  });

  it('rejects an unsupported type within the size limit', () => {
    expect(validateImageFile({ size: 1024, bytes: GIF })).toEqual({
      ok: false,
      code: 'UNSUPPORTED_TYPE',
    });
  });
});

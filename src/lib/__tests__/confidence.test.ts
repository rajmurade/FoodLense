import { describe, expect, it } from 'vitest';
import { mapConfidence } from '../confidence';
import { OCR_CONFIDENCE_THRESHOLDS } from '../constants';

describe('mapConfidence', () => {
  it('maps scores at or above the high threshold to HIGH', () => {
    expect(mapConfidence(OCR_CONFIDENCE_THRESHOLDS.high)).toBe('HIGH');
    expect(mapConfidence(100)).toBe('HIGH');
  });

  it('maps scores between the medium and high thresholds to MEDIUM', () => {
    expect(mapConfidence(OCR_CONFIDENCE_THRESHOLDS.medium)).toBe('MEDIUM');
    expect(mapConfidence(OCR_CONFIDENCE_THRESHOLDS.high - 1)).toBe('MEDIUM');
  });

  it('maps scores below the medium threshold to LOW', () => {
    expect(mapConfidence(OCR_CONFIDENCE_THRESHOLDS.medium - 1)).toBe('LOW');
    expect(mapConfidence(0)).toBe('LOW');
  });

  it('treats a non-numeric score as LOW', () => {
    expect(mapConfidence(Number.NaN)).toBe('LOW');
  });
});

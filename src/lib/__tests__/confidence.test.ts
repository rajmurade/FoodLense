import { describe, expect, it } from 'vitest';
import { mapConfidence, resolveConfirmedConfidence } from '../confidence';
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

describe('resolveConfirmedConfidence', () => {
  it('uses HIGH when the user typed or edited the review text', () => {
    expect(resolveConfirmedConfidence('LOW', true)).toBe('HIGH');
    expect(resolveConfirmedConfidence('MEDIUM', true)).toBe('HIGH');
    expect(resolveConfirmedConfidence('HIGH', true)).toBe('HIGH');
  });

  it('keeps the OCR confidence when the text was not edited', () => {
    expect(resolveConfirmedConfidence('LOW', false)).toBe('LOW');
    expect(resolveConfirmedConfidence('MEDIUM', false)).toBe('MEDIUM');
    expect(resolveConfirmedConfidence('HIGH', false)).toBe('HIGH');
  });

  it('upgrades an unedited low-confidence reading only after an edit', () => {
    const ocrConfidence = 'LOW' as const;
    expect(resolveConfirmedConfidence(ocrConfidence, false)).toBe('LOW');
    expect(resolveConfirmedConfidence(ocrConfidence, true)).toBe('HIGH');
  });
});

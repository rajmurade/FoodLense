import type { OcrConfidence } from './compare';
import { OCR_CONFIDENCE_THRESHOLDS } from './constants';

export function mapConfidence(score: number): OcrConfidence {
  if (score >= OCR_CONFIDENCE_THRESHOLDS.high) {
    return 'HIGH';
  }
  if (score >= OCR_CONFIDENCE_THRESHOLDS.medium) {
    return 'MEDIUM';
  }
  return 'LOW';
}

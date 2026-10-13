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

/**
 * The comparison uses the user-confirmed text. If the user typed or edited the
 * review box, the text no longer depends on the OCR reading, so it counts as
 * user-confirmed (HIGH). An untouched reading keeps its OCR confidence, so a
 * low-confidence reading still yields Insufficient evidence.
 */
export function resolveConfirmedConfidence(
  ocrConfidence: OcrConfidence,
  editedByUser: boolean,
): OcrConfidence {
  return editedByUser ? 'HIGH' : ocrConfidence;
}

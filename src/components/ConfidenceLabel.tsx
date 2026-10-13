import { uiStrings } from '../data/uiStrings';
import type { OcrConfidence } from '../lib/compare';

interface ConfidenceLabelProps {
  confidence: OcrConfidence;
}

const tone: Record<OcrConfidence, string> = {
  LOW: 'text-amber-800',
  MEDIUM: 'text-brand-dark/80',
  HIGH: 'text-brand',
};

export default function ConfidenceLabel({ confidence }: ConfidenceLabelProps) {
  return (
    <p className={`text-sm font-medium ${tone[confidence]}`}>
      {uiStrings.confidence.label}: {uiStrings.confidence[confidence]}
    </p>
  );
}

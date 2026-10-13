import { uiStrings } from '../data/uiStrings';
import type { OcrProgressStage } from '../lib/ocr';

interface OcrProgressProps {
  stage: OcrProgressStage;
  progress: number;
}

export default function OcrProgress({ stage, progress }: OcrProgressProps) {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const message = uiStrings.label.progress[stage];

  return (
    <div role="status" className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{message}</p>
      <div
        role="progressbar"
        aria-label={uiStrings.label.progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 w-full overflow-hidden rounded-full bg-black/10"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-brand-dark/70">{percent}%</p>
    </div>
  );
}

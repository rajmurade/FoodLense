import { uiStrings } from '../data/uiStrings';
import type { Classification } from '../lib/compare';

interface ClassificationBadgeProps {
  classification: Classification;
}

const tone: Record<Classification, string> = {
  CONSISTENT: 'bg-brand/10 text-brand',
  POTENTIAL_DISCREPANCY: 'bg-amber-100 text-amber-900',
  INSUFFICIENT_EVIDENCE: 'bg-slate-200 text-slate-700',
};

export default function ClassificationBadge({ classification }: ClassificationBadgeProps) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${tone[classification]}`}
    >
      <span aria-hidden="true" className="shrink-0">
        <StatusIcon classification={classification} />
      </span>
      <span>{uiStrings.classification[classification]}</span>
    </p>
  );
}

function StatusIcon({ classification }: ClassificationBadgeProps) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (classification === 'CONSISTENT') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    );
  }

  if (classification === 'POTENTIAL_DISCREPANCY') {
    return (
      <svg {...common}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

import { uiStrings } from '../data/uiStrings';

interface StepProgressProps {
  current: number;
}

export default function StepProgress({ current }: StepProgressProps) {
  const total = uiStrings.steps.labels.length;
  const stepText = uiStrings.steps.stepTemplate.replace('{n}', String(current));

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-xs font-medium text-brand-dark/70">{stepText}</p>
      <ol aria-label={uiStrings.steps.progressLabel} className="flex items-center gap-1.5">
        {uiStrings.steps.labels.map((label, index) => {
          const step = index + 1;
          const isCurrent = step === current;
          const isDone = step < current;
          return (
            <li key={label} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isCurrent
                    ? 'bg-brand text-white'
                    : isDone
                      ? 'bg-brand/20 text-brand'
                      : 'bg-black/10 text-brand-dark/60'
                }`}
              >
                {step}
              </span>
              <span className="sr-only">
                {label}
                {isCurrent ? ' (current step)' : ''}
              </span>
              {index < total - 1 ? (
                <span aria-hidden="true" className="h-px w-3 bg-black/15" />
              ) : null}
            </li>
          );
        })}
      </ol>
      <span aria-current="step" className="sr-only">
        {labelFor(current)}
      </span>
    </div>
  );
}

function labelFor(current: number): string {
  return uiStrings.steps.labels[current - 1] ?? '';
}

import type { ReactNode } from 'react';

interface ResultRowProps {
  label: string;
  children: ReactNode;
}

export default function ResultRow({ label, children }: ResultRowProps) {
  return (
    <div className="flex flex-col gap-1 border-t border-black/5 py-2 sm:flex-row sm:gap-3">
      <dt className="text-sm font-medium text-brand-dark/70 sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="min-w-0 text-sm text-brand-dark/90">{children}</dd>
    </div>
  );
}

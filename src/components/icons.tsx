type IconProps = { className?: string };

export function BrandMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Z"
        fill="currentColor"
      />
      <path
        d="M12 7c1.6 0 3 1.4 3 3.2 0 1.2-.6 2-1.4 2.6.9.4 1.6 1.1 1.6 2.2H8.8c0-1.1.7-1.8 1.6-2.2-.8-.6-1.4-1.4-1.4-2.6C9 8.4 10.4 7 12 7Z"
        fill="var(--color-page)"
      />
    </svg>
  );
}

function strokeProps() {
  return {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

export function ScanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function GuideIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M8 7h7" />
      <path d="M8 11h7" />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9a2.6 2.6 0 0 1 4.9 1.1c0 1.7-2.3 2-2.3 3.4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 9.5v5" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M5 4h3.2l1.3 4-1.9 1.4a12.5 12.5 0 0 0 5.9 5.9l1.4-1.9 4 1.3V19a1.8 1.8 0 0 1-2 1.8A16 16 0 0 1 3.2 6 1.8 1.8 0 0 1 5 4Z" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V5Z" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5 16 12l-6 3.5v-7Z" fill="currentColor" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps()}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function LabelIllustration({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden="true">
      <rect x="34" y="18" width="52" height="84" rx="8" stroke="currentColor" strokeWidth="3" />
      <path d="M46 36h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 48h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 60h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="82" r="10" stroke="currentColor" strokeWidth="3" />
      <path d="M60 76v12M54 82h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M78 28c8 0 14 6 14 14s-6 14-14 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

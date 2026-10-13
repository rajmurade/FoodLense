import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { uiStrings } from '../data/uiStrings';

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

function ScanIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M4 12h16" />
    </svg>
  );
}

function GuideIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M8 7h7" />
      <path d="M8 11h7" />
    </svg>
  );
}

function HistoryIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

type Tab = {
  to: string;
  label: string;
  end: boolean;
  Icon: ComponentType<IconProps>;
};

const tabs: Tab[] = [
  { to: '/', label: uiStrings.nav.home, end: true, Icon: HomeIcon },
  { to: '/scan', label: uiStrings.nav.scan, end: false, Icon: ScanIcon },
  { to: '/guide', label: uiStrings.nav.guide, end: false, Icon: GuideIcon },
  { to: '/history', label: uiStrings.nav.history, end: false, Icon: HistoryIcon },
];

export default function TabBar() {
  return (
    <nav
      aria-label={uiStrings.nav.tabsLabel}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex w-full max-w-[720px]">
        {tabs.map(({ to, label, end, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${
                  isActive ? 'text-brand' : 'text-brand-dark/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? 'h-6 w-6 text-brand' : 'h-6 w-6'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

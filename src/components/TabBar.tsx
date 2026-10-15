import { Link, useLocation } from 'react-router-dom';
import type { ComponentType } from 'react';
import { uiStrings } from '../data/uiStrings';
import { GuideIcon, HelpIcon, HomeIcon, ScanIcon } from './icons';

type IconProps = { className?: string };

type Tab = {
  to: string;
  label: string;
  Icon: ComponentType<IconProps>;
  isActive: (pathname: string) => boolean;
};

const tabs: Tab[] = [
  { to: '/', label: uiStrings.nav.home, Icon: HomeIcon, isActive: (path) => path === '/' },
  {
    to: '/scan',
    label: uiStrings.nav.scan,
    Icon: ScanIcon,
    isActive: (path) =>
      path.startsWith('/scan') ||
      path.startsWith('/product') ||
      path.startsWith('/label') ||
      path.startsWith('/result'),
  },
  { to: '/guide', label: uiStrings.nav.guide, Icon: GuideIcon, isActive: (path) => path.startsWith('/guide') },
  { to: '/help', label: uiStrings.nav.help, Icon: HelpIcon, isActive: (path) => path.startsWith('/help') },
];

export default function TabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={uiStrings.nav.tabsLabel}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-[720px]">
        {tabs.map(({ to, label, Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${
                  active ? 'font-semibold text-brand' : 'font-medium text-brand-dark/70'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 top-0 h-0.5 rounded-full ${
                    active ? 'bg-brand' : 'bg-transparent'
                  }`}
                />
                <span
                  className={`flex h-9 w-16 items-center justify-center rounded-full ${
                    active ? 'bg-brand/15' : ''
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

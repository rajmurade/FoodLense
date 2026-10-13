import { Link, NavLink } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';

const navItems = [
  { to: '/', label: uiStrings.nav.home, end: true },
  { to: '/scan', label: uiStrings.nav.scan, end: false },
  { to: '/guide', label: uiStrings.nav.guide, end: false },
  { to: '/history', label: uiStrings.nav.history, end: false },
];

function ShieldLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0"
      fill="none"
    >
      <path
        d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Z"
        fill="var(--color-brand)"
      />
      <path
        d="M12 7c1.6 0 3 1.4 3 3.2 0 1.2-.6 2-1.4 2.6.9.4 1.6 1.1 1.6 2.2H8.8c0-1.1.7-1.8 1.6-2.2-.8-.6-1.4-1.4-1.4-2.6C9 8.4 10.4 7 12 7Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          aria-label={uiStrings.a11y.logoLabel}
          className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ShieldLogo />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-brand">{uiStrings.app.name}</span>
            <span className="text-xs text-brand-dark/70">{uiStrings.app.tagline}</span>
          </span>
        </Link>

        <nav aria-label={uiStrings.nav.primaryLabel} className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-brand-dark/80 hover:bg-black/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/about"
            className="rounded px-3 py-2 text-sm font-medium text-brand-dark/80 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {uiStrings.nav.about}
          </Link>
        </nav>

        <Link
          to="/about"
          className="rounded px-3 py-2 text-sm font-medium text-brand hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
        >
          {uiStrings.nav.about}
        </Link>
      </div>
    </header>
  );
}

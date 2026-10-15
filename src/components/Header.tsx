import { Link } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import { BrandMark } from './icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          aria-label={uiStrings.a11y.logoLabel}
          className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <BrandMark className="h-8 w-8 shrink-0 text-brand" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-brand">{uiStrings.app.name}</span>
            <span className="text-xs text-brand-dark/70">{uiStrings.app.tagline}</span>
          </span>
        </Link>

        <Link
          to="/about"
          className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {uiStrings.nav.about}
        </Link>
      </div>
    </header>
  );
}

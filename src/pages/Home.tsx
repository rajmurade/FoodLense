import { Link } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

const linkBase =
  'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-brand">{uiStrings.pages.homeTitle}</h1>
        <p className="text-brand-dark/80">{uiStrings.app.tagline}</p>
      </div>

      <nav aria-label={uiStrings.nav.primaryLabel} className="space-y-2">
        <Link to="/scan" className={`${linkBase} bg-brand text-white`}>
          <span>{uiStrings.home.scanBarcode}</span>
          <ChevronIcon />
        </Link>
        <Link to="/scan" className={`${linkBase} bg-white text-brand-dark shadow-sm`}>
          <span>{uiStrings.home.typeBarcode}</span>
          <ChevronIcon />
        </Link>
        <Link to="/guide" className={`${linkBase} bg-white text-brand-dark shadow-sm`}>
          <span>{uiStrings.home.readLabel}</span>
          <ChevronIcon />
        </Link>
        <Link to="/guide#help" className={`${linkBase} bg-white text-brand-dark shadow-sm`}>
          <span>{uiStrings.home.officialHelp}</span>
          <ChevronIcon />
        </Link>
      </nav>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-brand-dark">{uiStrings.home.howItWorksTitle}</h2>
        <ol className="space-y-2">
          {uiStrings.home.howItWorks.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-brand-dark/90">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{uiStrings.home.note}</p>
    </section>
  );
}

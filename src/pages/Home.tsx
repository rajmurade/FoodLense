import { Link } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import { externalResourcesNotice, labelArticles, learnVideos } from '../data/resources';
import HelpCard from '../components/HelpCard';
import ResourceCard from '../components/ResourceCard';
import { ArrowRightIcon, BrandMark, LabelIllustration } from '../components/icons';

const actionBase =
  'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none';

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="hero-surface relative overflow-hidden rounded-3xl px-5 py-6 text-white shadow-card">
        <LabelIllustration className="pointer-events-none absolute -bottom-4 -right-3 h-32 w-32 text-white/15" />
        <div className="relative flex items-center gap-3">
          <BrandMark className="h-11 w-11 shrink-0 text-white" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{uiStrings.pages.homeTitle}</h1>
            <p className="text-sm text-white/90">{uiStrings.app.tagline}</p>
          </div>
        </div>
      </div>

      <nav aria-label={uiStrings.nav.primaryLabel} className="space-y-2">
        <Link to="/scan" className={`${actionBase} bg-brand text-white hover:brightness-95`}>
          <span>{uiStrings.home.scanBarcode}</span>
          <ArrowRightIcon className="h-5 w-5 shrink-0" />
        </Link>
        <Link
          to="/scan"
          className={`${actionBase} border border-brand/20 bg-white text-brand-dark shadow-card hover:bg-brand/5`}
        >
          <span>{uiStrings.home.typeBarcode}</span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand" />
        </Link>
      </nav>

      <HelpCard />

      <section aria-labelledby="learn-title" className="space-y-3">
        <h2 id="learn-title" className="text-lg font-bold text-brand">
          {uiStrings.home.learnTitle}
        </h2>
        <ul className="space-y-3">
          {labelArticles.map((card) => (
            <li key={card.id}>
              <ResourceCard card={card} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="watch-title" className="space-y-3">
        <h2 id="watch-title" className="text-lg font-bold text-brand">
          {uiStrings.home.watchTitle}
        </h2>
        <ul className="space-y-3">
          {learnVideos.map((card) => (
            <li key={card.id}>
              <ResourceCard card={card} />
            </li>
          ))}
        </ul>
        <p className="text-xs text-brand-dark/70">{externalResourcesNotice}</p>
      </section>

      <section aria-labelledby="how-title" className="space-y-3">
        <h2 id="how-title" className="text-lg font-bold text-brand">
          {uiStrings.home.howItWorksTitle}
        </h2>
        <ol className="grid grid-cols-3 gap-2">
          {uiStrings.home.howItWorks.map((step, index) => (
            <li
              key={step}
              className="flex min-w-0 flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-card"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand"
              >
                {index + 1}
              </span>
              <span className="break-words text-xs text-brand-dark/90">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{uiStrings.home.note}</p>
    </section>
  );
}

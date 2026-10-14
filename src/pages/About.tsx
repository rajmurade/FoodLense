import { uiStrings } from '../data/uiStrings';

export default function About() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-brand">{uiStrings.about.title}</h1>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-dark">{uiStrings.about.whatItDoesTitle}</h2>
        <p className="text-sm text-brand-dark/80">{uiStrings.about.whatItDoes}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-dark">{uiStrings.about.whatItDoesNotTitle}</h2>
        <p className="text-sm text-brand-dark/80">{uiStrings.about.whatItDoesNot}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-dark">{uiStrings.about.sourcesTitle}</h2>
        <ul className="space-y-2 text-sm text-brand-dark/90">
          <li>
            {uiStrings.about.sources.off}{' '}
            <a
              href="https://world.openfoodfacts.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              https://world.openfoodfacts.org/
            </a>
          </li>
          <li>{uiStrings.about.sources.fssai}</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-dark">{uiStrings.about.limitsTitle}</h2>
        <p className="text-sm text-brand-dark/80">{uiStrings.about.limits}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-dark">{uiStrings.about.privacyTitle}</h2>
        <p className="text-sm text-brand-dark/80">{uiStrings.about.privacy}</p>
      </div>

      <p className="text-sm font-medium text-brand-dark">{uiStrings.about.prototype}</p>
    </section>
  );
}

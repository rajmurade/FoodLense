import { uiStrings } from '../data/uiStrings';

export default function Home() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold text-brand">{uiStrings.pages.homeTitle}</h1>
      <p className="text-brand-dark/80">{uiStrings.app.tagline}</p>
      <p className="text-sm text-brand-dark/70">{uiStrings.pages.placeholder}</p>
    </section>
  );
}

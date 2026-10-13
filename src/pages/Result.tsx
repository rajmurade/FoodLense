import { uiStrings } from '../data/uiStrings';

export default function Result() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold text-brand">{uiStrings.pages.resultTitle}</h1>
      <p className="text-sm text-brand-dark/70">{uiStrings.pages.placeholder}</p>
    </section>
  );
}

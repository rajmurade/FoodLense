import { uiStrings } from '../data/uiStrings';

export default function Product() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold text-brand">{uiStrings.pages.productTitle}</h1>
      <p className="text-sm text-brand-dark/70">{uiStrings.pages.placeholder}</p>
    </section>
  );
}

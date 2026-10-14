import { uiStrings } from '../data/uiStrings';

export default function Guide() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-brand">{uiStrings.guide.howToReadTitle}</h1>
      <p className="text-sm text-brand-dark/80">{uiStrings.guide.howToReadIntro}</p>
      <ul className="space-y-3">
        <li className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="font-semibold text-brand-dark">{uiStrings.guide.points.name}</h2>
        </li>
        <li className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="font-semibold text-brand-dark">{uiStrings.guide.points.ingredients}</h2>
        </li>
        <li className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="font-semibold text-brand-dark">{uiStrings.guide.points.nutrition}</h2>
        </li>
        <li className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="font-semibold text-brand-dark">{uiStrings.guide.points.fssaiInfo}</h2>
        </li>
        <li className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="font-semibold text-brand-dark">{uiStrings.guide.points.dates}</h2>
        </li>
      </ul>

      <div id="help" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl font-bold text-brand">{uiStrings.guide.helpTitle}</h2>
        <p className="text-sm text-brand-dark/80">{uiStrings.guide.helpIntro}</p>
        <ul className="space-y-2 text-sm text-brand-dark/90">
          <li>{uiStrings.guide.helpLines.recheck}</li>
          <li>{uiStrings.guide.helpLines.officialInfo}</li>
          <li>{uiStrings.guide.helpLines.helpline}</li>
          <li>
            {uiStrings.guide.helpLines.foscos}{' '}
            <a
              href="https://foscos.fssai.gov.in/consumergrievance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              https://foscos.fssai.gov.in/consumergrievance
            </a>
          </li>
          <li>{uiStrings.guide.helpLines.ncl}</li>
          <li>{uiStrings.guide.helpLines.fboSearch}</li>
        </ul>
        <p className="text-sm font-medium text-brand-dark">{uiStrings.guide.helpLines.disclaimer}</p>
      </div>
    </section>
  );
}

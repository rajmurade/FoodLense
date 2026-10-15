import { Link } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import { externalResourcesNotice } from '../data/resources';
import HelpCard from '../components/HelpCard';
import { ArrowRightIcon } from '../components/icons';

export default function Help() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-brand">{uiStrings.pages.helpTitle}</h1>
        <p className="text-sm text-brand-dark/80">{uiStrings.help.intro}</p>
      </div>

      <HelpCard />

      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-card">
        <p className="text-sm text-brand-dark/80">{uiStrings.help.guidePrompt}</p>
        <Link
          to="/guide"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-brand/20 px-4 py-2 font-semibold text-brand transition hover:bg-brand/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
        >
          {uiStrings.help.guideLink}
          <ArrowRightIcon className="h-5 w-5 shrink-0" />
        </Link>
      </div>

      <p className="text-xs text-brand-dark/70">{externalResourcesNotice}</p>
    </section>
  );
}

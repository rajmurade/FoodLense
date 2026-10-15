import { uiStrings } from '../data/uiStrings';
import { officialChannels } from '../data/resources';
import { AlertIcon, ExternalLinkIcon, PhoneIcon } from './icons';

const channelRowBase =
  'flex min-h-[44px] items-center gap-3 rounded-2xl border border-amber-200 bg-white px-3 py-2.5 transition hover:bg-amber-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 motion-reduce:transition-none';

export default function HelpCard() {
  const { fssaiHelpline, consumerHelpline, foodSafetyConnect } = officialChannels;

  return (
    <section
      aria-labelledby="help-card-title"
      className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white"
        >
          <AlertIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 id="help-card-title" className="text-xl font-bold text-amber-950">
            {uiStrings.home.helpCardTitle}
          </h2>
          <p className="text-sm text-amber-900">{uiStrings.home.helpCardIntro}</p>
        </div>
      </div>

      <ul className="space-y-2">
        <li>
          <a href={fssaiHelpline.href} className={channelRowBase}>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"
            >
              <PhoneIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-amber-900">
                {fssaiHelpline.label}
              </span>
              <span className="block text-lg font-bold text-amber-950">{fssaiHelpline.value}</span>
            </span>
            {fssaiHelpline.note ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                {fssaiHelpline.note}
              </span>
            ) : null}
          </a>
        </li>
        <li>
          <a href={consumerHelpline.href} className={channelRowBase}>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"
            >
              <PhoneIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-amber-900">
                {consumerHelpline.label}
              </span>
              <span className="block text-lg font-bold text-amber-950">
                {consumerHelpline.value}
              </span>
            </span>
          </a>
        </li>
        <li>
          <a
            href={foodSafetyConnect.href}
            target="_blank"
            rel="noopener noreferrer"
            className={channelRowBase}
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"
            >
              <ExternalLinkIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-amber-900">
                {foodSafetyConnect.label}
              </span>
              <span className="block text-sm font-semibold text-amber-950">
                {foodSafetyConnect.value}
              </span>
              <span className="mt-0.5 block text-xs text-amber-800">
                {uiStrings.home.opensInNewTab}
              </span>
            </span>
          </a>
        </li>
      </ul>

      <p className="text-sm font-semibold text-amber-950">{uiStrings.guide.helpLines.disclaimer}</p>
    </section>
  );
}

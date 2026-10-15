import { uiStrings } from '../data/uiStrings';
import type { ResourceCard as ResourceCardData } from '../data/resources';
import { BookIcon, ExternalLinkIcon, PlayIcon } from './icons';

interface ResourceCardProps {
  card: ResourceCardData;
}

export default function ResourceCard({ card }: ResourceCardProps) {
  const Icon = card.kind === 'video' ? PlayIcon : BookIcon;

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[44px] items-start gap-3 rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transform-none motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-brand-dark">{card.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-brand-dark/70">
          <span>{card.source}</span>
          {card.kind === 'video' ? (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand">
              {uiStrings.home.searchOnYoutube}
            </span>
          ) : null}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-brand">
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          {uiStrings.home.opensInNewTab}
        </span>
      </span>
    </a>
  );
}

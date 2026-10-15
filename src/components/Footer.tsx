import { Link } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white/70 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 text-center text-xs text-brand-dark/80">
      <p className="mx-auto max-w-[720px]">{uiStrings.footer.disclaimer}</p>
      <p className="mt-1">
        <Link
          to="/help"
          className="font-medium text-brand underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {uiStrings.footer.helpLabel}
        </Link>
      </p>
    </footer>
  );
}

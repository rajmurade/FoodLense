import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TabBar from './TabBar';
import OfflineBanner from './OfflineBanner';
import { uiStrings } from '../data/uiStrings';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = mainRef.current?.querySelector<HTMLElement>('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-page text-brand-dark">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        {uiStrings.a11y.skipToContent}
      </a>
      <OfflineBanner />
      <Header />
      <main
        id="main-content"
        ref={mainRef}
        className="mx-auto w-full max-w-[720px] flex-1 px-4 pb-8 pt-4"
      >
        <Outlet />
      </main>
      <Footer />
      <TabBar />
    </div>
  );
}

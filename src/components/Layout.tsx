import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TabBar from './TabBar';
import { uiStrings } from '../data/uiStrings';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-brand-dark">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        {uiStrings.a11y.skipToContent}
      </a>
      <Header />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[720px] flex-1 px-4 pb-24 pt-4 md:pb-8"
      >
        <Outlet />
      </main>
      <Footer />
      <TabBar />
    </div>
  );
}

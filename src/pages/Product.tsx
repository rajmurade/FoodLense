import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import { fetchProduct } from '../lib/productClient';
import type { ApiErrorBody, ProductResponse } from '../lib/api';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import StepProgress from '../components/StepProgress';

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; data: ProductResponse }
  | { status: 'error'; error: ApiErrorBody['error'] };

function OpenFoodFactsNote({ text }: { text: string }) {
  return (
    <p className="text-sm text-brand-dark/70">
      {text}
      <a
        href="https://world.openfoodfacts.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {uiStrings.product.openFoodFactsLink}
      </a>
      .
    </p>
  );
}

export default function Product() {
  const { barcode = '' } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchProduct(barcode).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        setState({ status: 'ready', data: result.data });
      } else {
        setState({ status: 'error', error: result.error });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [barcode, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const continueHref = `/label/${encodeURIComponent(barcode)}`;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="min-h-[44px] rounded-lg px-2 py-2 text-sm font-medium text-brand hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {uiStrings.nav.back}
        </button>
        <StepProgress current={2} />
      </div>

      <h1 className="text-xl font-bold text-brand">{uiStrings.pages.productTitle}</h1>

      {state.status === 'loading' ? <Loading label={uiStrings.product.loading} /> : null}

      {state.status === 'error' ? (
        <ErrorBanner
          message={state.error.message}
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retry}
                className="min-h-[44px] rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {uiStrings.product.retry}
              </button>
              <Link
                to={continueHref}
                className="min-h-[44px] rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {uiStrings.product.continueWithoutRecord}
              </Link>
            </div>
          }
        />
      ) : null}

      {state.status === 'ready' && !state.data.found ? (
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-brand-dark">{uiStrings.product.notFoundTitle}</p>
          <p className="text-sm text-brand-dark/80">{uiStrings.product.notFoundBody}</p>
          <Link
            to={continueHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {uiStrings.product.continueWithoutRecord}
          </Link>
          <OpenFoodFactsNote text={uiStrings.product.notFoundNote} />
        </div>
      ) : null}

      {state.status === 'ready' && state.data.found && state.data.product ? (
        <div className="space-y-4">
          <ProductCard data={state.data} />

          {state.data.product.ingredientsText ? null : (
            <div className="space-y-2 rounded-xl bg-slate-100 p-3">
              <p className="text-sm text-slate-700">{uiStrings.product.noIngredients}</p>
              <OpenFoodFactsNote text={uiStrings.product.missingIngredientsNote} />
            </div>
          )}

          <Link
            to={continueHref}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-auto"
          >
            {uiStrings.product.next}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

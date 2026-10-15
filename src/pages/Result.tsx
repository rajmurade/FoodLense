import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import { SIMULATED_TEST_LABEL } from '../data/simulated';
import { compareIngredients } from '../lib/compare';
import type { OcrConfidence } from '../lib/compare';
import { resolveConfirmedConfidence } from '../lib/confidence';
import { checkLicenceNumber } from '../lib/licence';
import { fetchProduct } from '../lib/productClient';
import type { ApiErrorBody, ProductResponse } from '../lib/api';
import ClassificationBadge from '../components/ClassificationBadge';
import ConfidenceLabel from '../components/ConfidenceLabel';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';
import ResultRow from '../components/ResultRow';
import StepProgress from '../components/StepProgress';

interface ResultLocationState {
  observedText?: string;
  ocrConfidence?: OcrConfidence;
  edited?: boolean;
  simulated?: boolean;
}

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; data: ProductResponse }
  | { status: 'error'; error: ApiErrorBody['error'] };

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return uiStrings.product.unavailable;
  }
  return date.toLocaleString();
}

function listOrNone(items: string[]): string {
  return items.length > 0 ? items.join(', ') : uiStrings.result.noItems;
}

export default function Result() {
  const { barcode = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as ResultLocationState;

  const observedText = routeState.observedText ?? '';
  const hasObservedText = observedText.trim() !== '';
  const edited = routeState.edited === true;
  const ocrConfidence: OcrConfidence = routeState.ocrConfidence ?? 'LOW';
  const confidence = resolveConfirmedConfidence(ocrConfidence, edited);

  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [licenceNumber, setLicenceNumber] = useState('');

  useEffect(() => {
    if (!hasObservedText) {
      return;
    }
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
  }, [barcode, hasObservedText, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  if (!hasObservedText) {
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
          <StepProgress current={5} />
        </div>
        <h1 className="text-xl font-bold text-brand">{uiStrings.result.heading}</h1>
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-brand-dark">{uiStrings.result.noText}</p>
          <p className="text-sm text-brand-dark/80">{uiStrings.result.noTextBody}</p>
          <Link
            to={`/label/${encodeURIComponent(barcode)}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {uiStrings.result.backToLabel}
          </Link>
        </div>
      </section>
    );
  }

  if (state.status === 'loading') {
    return (
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-brand">{uiStrings.result.heading}</h1>
          <StepProgress current={5} />
        </div>
        <Loading label={uiStrings.result.loading} />
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-brand">{uiStrings.result.heading}</h1>
          <StepProgress current={5} />
        </div>
        <ErrorBanner
          message={state.error.message}
          action={
            <button
              type="button"
              onClick={retry}
              className="min-h-[44px] rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {uiStrings.result.retry}
            </button>
          }
        />
      </section>
    );
  }

  const { data } = state;
  const product = data.product;
  const referenceText = data.found && product?.ingredientsText ? product.ingredientsText : '';
  const finding = compareIngredients(observedText, referenceText, confidence, {
    retrievedAt: data.retrievedAt,
  });
  const licenceCheck = checkLicenceNumber(licenceNumber);

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
        <StepProgress current={5} />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name ?? uiStrings.product.unavailable}
            className="h-16 w-16 shrink-0 rounded-xl object-contain"
            loading="lazy"
          />
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-brand-dark">
            {product?.name ?? uiStrings.product.unavailable}
          </h1>
          <p className="text-sm text-brand-dark/80">
            <span className="font-medium">{uiStrings.product.barcodeLabel}</span>{' '}
            <span className="font-mono">{data.barcode}</span>
          </p>
        </div>
      </div>

      <section aria-labelledby="observed-heading" className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="observed-heading" className="text-base font-semibold text-brand-dark">
            {uiStrings.result.blocks.observed}
          </h2>
          {routeState.simulated ? (
            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-900">
              {SIMULATED_TEST_LABEL}
            </span>
          ) : null}
          {edited ? (
            <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-brand-dark/80">
              {uiStrings.result.editedBadge}
            </span>
          ) : null}
        </div>
        {routeState.simulated ? (
          <p className="text-xs text-purple-900">{uiStrings.result.simulatedNote}</p>
        ) : null}
        <ConfidenceLabel confidence={ocrConfidence} />
        {edited ? <p className="text-xs text-brand-dark/70">{uiStrings.result.editedNote}</p> : null}
        <p className="whitespace-pre-wrap rounded-xl bg-black/[0.03] p-3 text-sm text-brand-dark/90">
          {observedText}
        </p>
        <ResultRow label={uiStrings.result.source}>{uiStrings.result.observedSource}</ResultRow>
      </section>

      <section aria-labelledby="reference-heading" className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <h2 id="reference-heading" className="text-base font-semibold text-brand-dark">
          {uiStrings.result.blocks.reference}
        </h2>
        <dl className="space-y-0">
          <ResultRow label={uiStrings.result.productRecord}>
            {data.found ? uiStrings.result.productFound : uiStrings.result.productNotFound}
          </ResultRow>
          <ResultRow label={uiStrings.result.source}>{uiStrings.result.referenceSource}</ResultRow>
          <ResultRow label={uiStrings.result.retrieved}>{formatDateTime(data.retrievedAt)}</ResultRow>
          <ResultRow label={uiStrings.product.ingredientsHeading}>
            {referenceText ? (
              <span className="whitespace-pre-wrap">{referenceText}</span>
            ) : (
              uiStrings.result.referenceNoRecord
            )}
          </ResultRow>
        </dl>
      </section>

      <section aria-labelledby="licence-heading" className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <h2 id="licence-heading" className="text-base font-semibold text-brand-dark">
          {uiStrings.result.licence.label}
        </h2>
        <label htmlFor="fssai-licence" className="block text-sm font-medium text-brand-dark">
          {uiStrings.result.licence.inputLabel}
        </label>
        <input
          id="fssai-licence"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={licenceNumber}
          onChange={(event) => setLicenceNumber(event.target.value)}
          placeholder={uiStrings.result.licence.placeholder}
          aria-describedby="fssai-licence-help"
          className="min-h-[44px] w-full rounded-lg border border-black/15 bg-white px-3 text-sm text-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        {licenceCheck === 'FORMAT_OK' ? (
          <p id="fssai-licence-help" className="text-sm text-brand-dark/90">
            {uiStrings.result.licence.formatOk}{' '}
            <a
              href="https://foscos.fssai.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {uiStrings.result.licence.foscosLink}
            </a>
          </p>
        ) : null}
        {licenceCheck === 'WRONG_LENGTH' || licenceCheck === 'NON_DIGITS' ? (
          <p id="fssai-licence-help" role="alert" className="text-sm font-medium text-amber-800">
            {uiStrings.result.licence.wrongFormat}
          </p>
        ) : null}
        <p className="text-xs text-brand-dark/70">{uiStrings.result.licence.privacyNote}</p>
      </section>

      <section aria-labelledby="conclusion-heading" className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 id="conclusion-heading" className="text-base font-semibold text-brand-dark">
          {uiStrings.result.blocks.conclusion}
        </h2>
        <ClassificationBadge classification={finding.classification} />
        <p className="text-sm text-brand-dark/90">{finding.explanation}</p>
        <p className="rounded-xl bg-black/[0.03] p-3 text-sm font-medium text-brand-dark">
          {uiStrings.result.disclaimer}
        </p>
        <dl className="space-y-0">
          <ResultRow label={uiStrings.result.matchedCount}>
            {finding.matched.length}
          </ResultRow>
          <ResultRow label={uiStrings.result.onlyOnLabelCount}>
            {listOrNone(finding.onlyOnLabel)}
          </ResultRow>
          <ResultRow label={uiStrings.result.onlyInRecordCount}>
            {listOrNone(finding.onlyInRecord)}
          </ResultRow>
          <ResultRow label={uiStrings.result.method}>{finding.method}</ResultRow>
          <ResultRow label={uiStrings.result.source}>{finding.sources.reference}</ResultRow>
          <ResultRow label={uiStrings.result.retrieved}>
            {formatDateTime(finding.sources.retrievedAt)}
          </ResultRow>
        </dl>
      </section>

      <section aria-labelledby="limits-heading" className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <h2 id="limits-heading" className="text-base font-semibold text-brand-dark">
          {uiStrings.result.blocks.limits}
        </h2>
        <p className="text-sm text-brand-dark/90">{uiStrings.result.limitsBody}</p>
      </section>

      <section aria-labelledby="next-heading" className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 id="next-heading" className="text-base font-semibold text-brand-dark">
          {uiStrings.result.blocks.nextSteps}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/label/${encodeURIComponent(barcode)}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {uiStrings.result.nextRecheck}
          </Link>
          <Link
            to="/guide#help"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {uiStrings.result.nextHelp}
          </Link>
          <Link
            to="/scan"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {uiStrings.result.nextScanAnother}
          </Link>
        </div>
      </section>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import { validateBarcode } from '../lib/barcode';
import { checkCameraAvailability } from '../lib/scan';
import type { CameraAvailability } from '../lib/scan';
import BarcodeInput from '../components/BarcodeInput';
import BarcodeScanner from '../components/BarcodeScanner';
import ErrorBanner from '../components/ErrorBanner';
import StepProgress from '../components/StepProgress';

type CameraState = CameraAvailability | 'CHECKING' | 'DENIED';

const CAMERA_TIMEOUT_MS = 15000;

export default function Scan() {
  const navigate = useNavigate();
  const [camera, setCamera] = useState<CameraState>('CHECKING');
  const [scannerActive, setScannerActive] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCamera(
      checkCameraAvailability({
        isSecureContext: typeof window !== 'undefined' && window.isSecureContext,
        hasMediaDevices:
          typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
      }),
    );
  }, []);

  useEffect(() => {
    if (!scannerActive) {
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), CAMERA_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [scannerActive]);

  const go = useCallback(
    (raw: string) => {
      const result = validateBarcode(raw);
      if (!result.valid) {
        setError(result.message);
        return;
      }
      setError(null);
      navigate(`/product/${encodeURIComponent(result.barcode)}`);
    },
    [navigate],
  );

  const handleStatusChange = useCallback((status: 'ACTIVE' | 'DENIED') => {
    if (status === 'DENIED') {
      setCamera('DENIED');
      return;
    }
    setScannerActive(true);
  }, []);

  const cameraMessage =
    camera === 'DENIED'
      ? uiStrings.scan.denied
      : camera === 'INSECURE_CONTEXT'
        ? uiStrings.scan.insecure
        : camera === 'UNSUPPORTED'
          ? uiStrings.scan.unsupported
          : null;

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
        <StepProgress current={1} />
      </div>

      <h1 className="text-xl font-bold text-brand">{uiStrings.pages.scanTitle}</h1>

      {camera === 'AVAILABLE' ? (
        <div className="space-y-2">
          <BarcodeScanner onConfirmed={go} onStatusChange={handleStatusChange} />
          <p className="text-sm text-brand-dark/80">{uiStrings.scan.hint}</p>
          <p className="text-xs text-brand-dark/60">{uiStrings.scan.confirmHint}</p>
          {timedOut ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              {uiStrings.scan.timeout}
            </p>
          ) : null}
        </div>
      ) : null}

      {cameraMessage ? (
        <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{cameraMessage}</p>
      ) : null}

      {camera !== 'AVAILABLE' ? (
        <p className="text-sm font-medium text-brand-dark">{uiStrings.scan.typeInstead}</p>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      <BarcodeInput value={typed} onChange={setTyped} onSubmit={() => go(typed)} />
    </section>
  );
}

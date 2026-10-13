import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uiStrings } from '../data/uiStrings';
import type { OcrConfidence } from '../lib/compare';
import type { ImageValidationErrorCode } from '../lib/imageValidation';
import { validateImageFile } from '../lib/imageValidation';
import { runOcr, resizeImageForOcr } from '../lib/ocr';
import type { OcrProgress, OcrProgressStage } from '../lib/ocr';
import ErrorBanner from '../components/ErrorBanner';
import ConfidenceLabel from '../components/ConfidenceLabel';
import ImagePicker from '../components/ImagePicker';
import OcrProgressBar from '../components/OcrProgress';
import StepProgress from '../components/StepProgress';
import TextReview from '../components/TextReview';

type Phase = 'idle' | 'reading' | 'review';

function validationMessage(code: ImageValidationErrorCode): string {
  switch (code) {
    case 'EMPTY':
      return uiStrings.label.errors.empty;
    case 'TOO_LARGE':
      return uiStrings.label.errors.tooLarge;
    case 'UNSUPPORTED_TYPE':
      return uiStrings.label.errors.unsupported;
  }
}

export default function Label() {
  const { barcode = '' } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<OcrConfidence | null>(null);
  const [edited, setEdited] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  useEffect(() => revokePreview, [revokePreview]);

  const resetLabel = useCallback(() => {
    revokePreview();
    setPreviewUrl(null);
    setFile(null);
    setText('');
    setConfidence(null);
    setEdited(false);
    setProgress(null);
    setError(null);
    setPhase('idle');
  }, [revokePreview]);

  const handleFileChosen = useCallback(
    async (chosen: File) => {
      const header = new Uint8Array(await chosen.slice(0, 12).arrayBuffer());
      const result = validateImageFile({ size: chosen.size, bytes: header });

      if (!result.ok) {
        resetLabel();
        setError(validationMessage(result.code));
        return;
      }

      revokePreview();
      const url = URL.createObjectURL(chosen);
      previewRef.current = url;
      setPreviewUrl(url);
      setFile(chosen);
      setText('');
      setConfidence(null);
      setEdited(false);
      setProgress(null);
      setError(null);
      setPhase('idle');
    },
    [resetLabel, revokePreview],
  );

  const handleReadText = useCallback(async () => {
    if (!file) {
      setError(uiStrings.label.chooseFirst);
      return;
    }

    setPhase('reading');
    setError(null);
    setProgress({ stage: 'PREPARING', progress: 0 });

    let prepared: Blob;
    try {
      prepared = await resizeImageForOcr(file);
    } catch {
      setPhase('review');
      setProgress(null);
      setError(uiStrings.label.errors.prepareFailed);
      return;
    }

    try {
      const outcome = await runOcr(prepared, (update) => setProgress(update));
      setText(outcome.text);
      setConfidence(outcome.confidence);
      setEdited(false);
      setPhase('review');
    } catch {
      setPhase('review');
      setError(uiStrings.label.errors.readFailed);
    } finally {
      setProgress(null);
    }
  }, [file]);

  const handleCompare = useCallback(() => {
    if (text.trim() === '') {
      setError(uiStrings.label.needText);
      return;
    }
    navigate(`/result/${encodeURIComponent(barcode)}`, {
      state: { observedText: text, ocrConfidence: confidence ?? 'LOW', edited },
    });
  }, [barcode, confidence, edited, navigate, text]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    setEdited(true);
  }, []);

  const isReading = phase === 'reading';
  const showReview = phase === 'review' || (phase === 'reading' && text.length > 0);

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
        <StepProgress current={3} />
      </div>

      <h1 className="text-xl font-bold text-brand">{uiStrings.pages.labelTitle}</h1>

      <ImagePicker
        previewUrl={previewUrl}
        disabled={isReading}
        onFileChosen={handleFileChosen}
        onRetake={resetLabel}
      />

      {error ? <ErrorBanner message={error} /> : null}

      {previewUrl && !isReading ? (
        <button
          type="button"
          onClick={handleReadText}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-auto"
        >
          {uiStrings.label.readText}
        </button>
      ) : null}

      {isReading && progress ? (
        <OcrProgressBar stage={progress.stage as OcrProgressStage} progress={progress.progress} />
      ) : null}

      {showReview ? (
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-brand-dark">
            {uiStrings.label.reviewHeading}
          </h2>

          {confidence ? <ConfidenceLabel confidence={confidence} /> : null}

          {confidence === 'LOW' ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              {uiStrings.label.lowConfidenceWarning}
            </p>
          ) : null}

          <TextReview value={text} onChange={handleTextChange} disabled={isReading} />

          <button
            type="button"
            onClick={handleCompare}
            disabled={isReading}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 sm:w-auto"
          >
            {uiStrings.label.compare}
          </button>
        </div>
      ) : null}
    </section>
  );
}

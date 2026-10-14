import { useCallback, useEffect, useRef, useState } from 'react';
import { BarcodeFormat, BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { uiStrings } from '../data/uiStrings';
import { validateBarcode } from '../lib/barcode';
import { confirmScan } from '../lib/scan';

const SUPPORTED_FORMATS = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A];

type ScannerStatus = 'STARTING' | 'ACTIVE' | 'DENIED';

interface BarcodeScannerProps {
  onConfirmed: (barcode: string) => void;
  onStatusChange: (status: 'ACTIVE' | 'DENIED') => void;
}

export default function BarcodeScanner({ onConfirmed, onStatusChange }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastReadRef = useRef<string | null>(null);
  const onConfirmedRef = useRef(onConfirmed);
  const onStatusChangeRef = useRef(onStatusChange);
  const [status, setStatus] = useState<ScannerStatus>('STARTING');

  onConfirmedRef.current = onConfirmed;
  onStatusChangeRef.current = onStatusChange;

  const handleResult = useCallback((raw: string, stop: () => void) => {
    if (!validateBarcode(raw).valid) {
      return;
    }
    const { confirmed, lastRead } = confirmScan(lastReadRef.current, raw);
    lastReadRef.current = lastRead;
    if (!confirmed) {
      return;
    }
    stop();
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(100);
    }
    onConfirmedRef.current(lastRead);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    let controls: IScannerControls | null = null;
    let stopped = false;

    const stopAll = () => {
      stopped = true;
      controls?.stop();
      const stream = video?.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
        if (video) {
          video.srcObject = null;
        }
      }
    };

    const reader = new BrowserMultiFormatReader();
    reader.possibleFormats = SUPPORTED_FORMATS;

    reader
      .decodeFromVideoDevice(undefined, video ?? undefined, (result) => {
        if (stopped || !result) {
          return;
        }
        handleResult(result.getText(), stopAll);
      })
      .then((scannerControls) => {
        if (stopped) {
          scannerControls.stop();
          return;
        }
        controls = scannerControls;
        setStatus('ACTIVE');
        onStatusChangeRef.current('ACTIVE');
      })
      .catch(() => {
        if (stopped) {
          return;
        }
        setStatus('DENIED');
        onStatusChangeRef.current('DENIED');
      });

    return stopAll;
  }, [handleResult]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label={uiStrings.scan.cameraLabel}
        className={`h-56 w-full object-cover ${status === 'ACTIVE' ? '' : 'opacity-30'}`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-24 w-4/5 rounded-lg border-2 border-white/80" />
      </div>
      <p
        role="status"
        className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-center text-xs text-white"
      >
        {status === 'STARTING' ? uiStrings.scan.starting : uiStrings.scan.scanning}
      </p>
    </div>
  );
}

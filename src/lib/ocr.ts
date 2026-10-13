import * as Tesseract from 'tesseract.js';
import type { OcrConfidence } from './compare';
import { mapConfidence } from './confidence';
import { MAX_IMAGE_LONG_SIDE, OCR_ASSET_PATHS } from './constants';

export type OcrProgressStage = 'PREPARING' | 'CORE' | 'LANGUAGE' | 'INITIALIZE' | 'RECOGNIZE';

export interface OcrProgress {
  stage: OcrProgressStage;
  progress: number;
}

export interface OcrOutcome {
  text: string;
  rawConfidence: number;
  confidence: OcrConfidence;
}

function stageForStatus(status: string): OcrProgressStage {
  switch (status) {
    case 'loading tesseract core':
      return 'CORE';
    case 'loading language traineddata':
      return 'LANGUAGE';
    case 'initializing api':
      return 'INITIALIZE';
    case 'recognizing text':
      return 'RECOGNIZE';
    default:
      return 'PREPARING';
  }
}

async function loadImageElement(url: string): Promise<HTMLImageElement> {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image-load-failed'));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('resize-failed'))), 'image/png');
  });
}

export async function resizeImageForOcr(
  file: Blob,
  maxLongSide: number = MAX_IMAGE_LONG_SIDE,
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(url);
    const longest = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longest > maxLongSide ? maxLongSide / longest : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('canvas-unavailable');
    }
    context.drawImage(image, 0, 0, width, height);

    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function runOcr(
  image: Blob,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrOutcome> {
  const worker = await Tesseract.createWorker('eng', Tesseract.OEM.LSTM_ONLY, {
    workerPath: OCR_ASSET_PATHS.workerPath,
    corePath: OCR_ASSET_PATHS.corePath,
    langPath: OCR_ASSET_PATHS.langPath,
    gzip: true,
    workerBlobURL: false,
    logger: (message: Tesseract.LoggerMessage) => {
      onProgress?.({ stage: stageForStatus(message.status), progress: message.progress });
    },
  });

  try {
    const { data } = await worker.recognize(image);
    const rawConfidence = typeof data.confidence === 'number' ? data.confidence : 0;
    return {
      text: typeof data.text === 'string' ? data.text : '',
      rawConfidence,
      confidence: mapConfidence(rawConfidence),
    };
  } finally {
    await worker.terminate();
  }
}

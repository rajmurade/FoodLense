export const COMPARISON_THRESHOLDS = {
  similarity: 0.85,
  matchedRatio: 0.9,
  unmatchedRatio: 0.1,
  minItemsPerSide: 3,
} as const;

export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_IMAGE_LONG_SIDE = 1600;

export const ACCEPTED_IMAGE_TYPES: ReadonlyArray<ImageType> = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const OCR_ASSET_PATHS = {
  workerPath: '/ocr/worker.min.js',
  corePath: '/ocr/core',
  langPath: '/ocr/lang',
} as const;

export const OCR_CONFIDENCE_THRESHOLDS = {
  medium: 70,
  high: 85,
} as const;

export const DECLARATION_PHRASES = [
  'contains permitted natural colour',
  'contains permitted natural color',
  'contains permitted synthetic food colour',
  'contains permitted synthetic food color',
  'contains permitted class ii preservative',
  'contains added flavour',
  'contains added flavor',
  'contains added colours',
  'contains added colors',
  'added flavour',
  'added flavor',
  'colour added',
  'color added',
] as const;

export const SPELLING_VARIANTS: Readonly<Record<string, string>> = {
  colour: 'color',
  flavour: 'flavor',
  sulphur: 'sulfur',
  aluminium: 'aluminum',
  fibre: 'fiber',
  yoghurt: 'yogurt',
};

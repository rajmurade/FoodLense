export const COMPARISON_THRESHOLDS = {
  similarity: 0.85,
  matchedRatio: 0.9,
  unmatchedRatio: 0.1,
  minItemsPerSide: 3,
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

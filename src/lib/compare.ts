import { COMPARISON_THRESHOLDS } from './constants';
import { normalizeIngredients, similarity } from './normalize';

export type Classification =
  | 'CONSISTENT'
  | 'POTENTIAL_DISCREPANCY'
  | 'INSUFFICIENT_EVIDENCE';

export type OcrConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Finding {
  id: string;
  type: 'ingredient_list';
  observedItems: string[];
  referenceItems: string[];
  matched: string[];
  onlyOnLabel: string[];
  onlyInRecord: string[];
  orderDiffers: boolean;
  classification: Classification;
  uncertaintyNote: string;
  sources: { observed: string; reference: string; retrievedAt: string };
  method: string;
  explanation: string;
}

export interface CompareOptions {
  id?: string;
  retrievedAt?: string;
}

interface ClassifyInput {
  referenceItems: string[];
  observedItems: string[];
  matchedCount: number;
  onlyOnLabelCount: number;
  ocrConfidence: OcrConfidence;
}

interface ClassifyResult {
  classification: Classification;
  uncertaintyNote: string;
}

interface MatchPair {
  ref: number;
  obs: number;
}

export function compareIngredients(
  observedText: string,
  referenceText: string,
  ocrConfidence: OcrConfidence,
  options: CompareOptions = {},
): Finding {
  const observedItems = normalizeIngredients(observedText);
  const referenceItems = normalizeIngredients(referenceText);

  const usedObserved = new Set<number>();
  const matched: string[] = [];
  const pairs: MatchPair[] = [];

  referenceItems.forEach((referenceItem, refIndex) => {
    let bestIndex = -1;
    let bestScore = 0;

    observedItems.forEach((observedItem, obsIndex) => {
      if (usedObserved.has(obsIndex)) {
        return;
      }
      const score = similarity(referenceItem, observedItem);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = obsIndex;
      }
    });

    if (bestIndex >= 0 && bestScore >= COMPARISON_THRESHOLDS.similarity) {
      usedObserved.add(bestIndex);
      matched.push(referenceItem);
      pairs.push({ ref: refIndex, obs: bestIndex });
    }
  });

  const matchedReferenceIndexes = new Set(pairs.map((pair) => pair.ref));
  const onlyInRecord = referenceItems.filter((_, index) => !matchedReferenceIndexes.has(index));
  const onlyOnLabel = observedItems.filter((_, index) => !usedObserved.has(index));
  const orderDiffers = detectOrderDiffers(pairs);

  const { classification, uncertaintyNote } = classify({
    referenceItems,
    observedItems,
    matchedCount: matched.length,
    onlyOnLabelCount: onlyOnLabel.length,
    ocrConfidence,
  });

  return {
    id: options.id ?? 'ingredient-list',
    type: 'ingredient_list',
    observedItems,
    referenceItems,
    matched,
    onlyOnLabel,
    onlyInRecord,
    orderDiffers,
    classification,
    uncertaintyNote,
    sources: {
      observed: 'user-confirmed label text',
      reference: 'Open Food Facts',
      retrievedAt: options.retrievedAt ?? '',
    },
    method: `normalised, fuzzy match >= ${COMPARISON_THRESHOLDS.similarity}, order ignored`,
    explanation: buildExplanation(classification, uncertaintyNote),
  };
}

function detectOrderDiffers(pairs: MatchPair[]): boolean {
  for (let i = 1; i < pairs.length; i += 1) {
    if (pairs[i].obs < pairs[i - 1].obs) {
      return true;
    }
  }
  return false;
}

function classify(input: ClassifyInput): ClassifyResult {
  const { referenceItems, observedItems, matchedCount, onlyOnLabelCount, ocrConfidence } = input;

  if (referenceItems.length === 0 || observedItems.length === 0) {
    let note: string;
    if (referenceItems.length === 0 && observedItems.length === 0) {
      note = 'No ingredient list was available on either side to compare.';
    } else if (referenceItems.length === 0) {
      note = 'The database record has no ingredient list to compare against.';
    } else {
      note = 'No label ingredient text was provided to compare.';
    }
    return { classification: 'INSUFFICIENT_EVIDENCE', uncertaintyNote: note };
  }

  if (ocrConfidence === 'LOW') {
    return {
      classification: 'INSUFFICIENT_EVIDENCE',
      uncertaintyNote:
        'The label text was read with low confidence, so it is not reliable enough to compare.',
    };
  }

  if (
    referenceItems.length < COMPARISON_THRESHOLDS.minItemsPerSide ||
    observedItems.length < COMPARISON_THRESHOLDS.minItemsPerSide
  ) {
    return {
      classification: 'INSUFFICIENT_EVIDENCE',
      uncertaintyNote:
        'There were fewer than three ingredients on one side, which is too little to compare meaningfully.',
    };
  }

  const matchedRatio = matchedCount / referenceItems.length;
  const unmatchedObservedRatio = onlyOnLabelCount / observedItems.length;

  if (
    matchedRatio >= COMPARISON_THRESHOLDS.matchedRatio &&
    unmatchedObservedRatio <= COMPARISON_THRESHOLDS.unmatchedRatio
  ) {
    return { classification: 'CONSISTENT', uncertaintyNote: '' };
  }

  return { classification: 'POTENTIAL_DISCREPANCY', uncertaintyNote: '' };
}

function buildExplanation(classification: Classification, uncertaintyNote: string): string {
  switch (classification) {
    case 'CONSISTENT':
      return 'No material difference was found in what was compared.';
    case 'POTENTIAL_DISCREPANCY':
      return 'The label text and the record differ. This can be caused by a recipe change, a regional version, an outdated record or a reading error. Please re-check.';
    case 'INSUFFICIENT_EVIDENCE':
      return uncertaintyNote;
  }
}

import { describe, expect, it } from 'vitest';
import { compareIngredients } from '../compare';
import { COMPARISON_THRESHOLDS } from '../constants';
import { SIMULATED_TEST_LABEL } from '../../data/simulated';
import { uiStrings } from '../../data/uiStrings';

const FIVE_A = 'Water, Sugar, Salt, Citric Acid, Natural Flavour';
const FIVE_B = 'Salt, Water, Natural Flavour, Sugar, Citric Acid';

describe('comparison thresholds', () => {
  it('are defined in one place as the documented starting values', () => {
    expect(COMPARISON_THRESHOLDS).toEqual({
      similarity: 0.85,
      matchedRatio: 0.9,
      unmatchedRatio: 0.1,
      minItemsPerSide: 3,
    });
  });
});

describe('Simulated test labelling', () => {
  it('exposes the required wording for deliberately altered label text', () => {
    expect(SIMULATED_TEST_LABEL).toBe('Simulated test');
    expect(uiStrings.simulated.label).toBe(SIMULATED_TEST_LABEL);
  });
});

describe('compareIngredients: identical', () => {
  it('returns CONSISTENT when the lists match exactly', () => {
    const finding = compareIngredients(FIVE_A, FIVE_A, 'HIGH');
    expect(finding.classification).toBe('CONSISTENT');
    expect(finding.matched).toHaveLength(5);
    expect(finding.onlyOnLabel).toEqual([]);
    expect(finding.onlyInRecord).toEqual([]);
    expect(finding.orderDiffers).toBe(false);
    expect(finding.type).toBe('ingredient_list');
    expect(finding.method).toContain(`>= ${COMPARISON_THRESHOLDS.similarity}`);
    expect(finding.sources.reference).toBe('Open Food Facts');
  });
});

describe('compareIngredients: reordered', () => {
  it('returns CONSISTENT with orderDiffers true when only the order changes', () => {
    const finding = compareIngredients(FIVE_B, FIVE_A, 'HIGH');
    expect(finding.classification).toBe('CONSISTENT');
    expect(finding.orderDiffers).toBe(true);
    expect(finding.onlyOnLabel).toEqual([]);
    expect(finding.onlyInRecord).toEqual([]);
  });
});

describe('compareIngredients: spelling variant', () => {
  it('matches common spelling variants such as colour/color and flavour/flavor', () => {
    const observed = 'Water, Sugar, Salt, Colour, Flavour';
    const reference = 'Water, Sugar, Salt, Color, Flavor';
    const finding = compareIngredients(observed, reference, 'HIGH');
    expect(finding.classification).toBe('CONSISTENT');
    expect(finding.onlyOnLabel).toEqual([]);
    expect(finding.onlyInRecord).toEqual([]);
  });
});

describe('compareIngredients: one extra item on the label', () => {
  it('returns POTENTIAL_DISCREPANCY and lists the extra item in onlyOnLabel', () => {
    const observed = `${FIVE_A}, Sodium Benzoate`;
    const finding = compareIngredients(observed, FIVE_A, 'HIGH');
    expect(finding.classification).toBe('POTENTIAL_DISCREPANCY');
    expect(finding.onlyOnLabel).toEqual(['sodium benzoate']);
    expect(finding.onlyInRecord).toEqual([]);
  });
});

describe('compareIngredients: one missing item from the label', () => {
  it('returns POTENTIAL_DISCREPANCY and lists the missing item in onlyInRecord', () => {
    const reference = `${FIVE_A}, Sodium Benzoate`;
    const finding = compareIngredients(FIVE_A, reference, 'HIGH');
    expect(finding.classification).toBe('POTENTIAL_DISCREPANCY');
    expect(finding.onlyInRecord).toEqual(['sodium benzoate']);
    expect(finding.onlyOnLabel).toEqual([]);
  });
});

describe('compareIngredients: heavy mismatch', () => {
  it('returns POTENTIAL_DISCREPANCY when the lists share little in common', () => {
    const observed = 'Wheat Flour, Palm Oil, Yeast, Emulsifier';
    const reference = 'Water, Sugar, Salt, Citric Acid';
    const finding = compareIngredients(observed, reference, 'HIGH');
    expect(finding.classification).toBe('POTENTIAL_DISCREPANCY');
    expect(finding.matched).toHaveLength(0);
    expect(finding.explanation).toContain('recipe change');
    expect(finding.explanation).toContain('reading error');
  });
});

describe('compareIngredients: empty inputs', () => {
  it('returns INSUFFICIENT_EVIDENCE when the reference is empty', () => {
    const finding = compareIngredients('Water, Sugar, Salt', '', 'HIGH');
    expect(finding.classification).toBe('INSUFFICIENT_EVIDENCE');
    expect(finding.referenceItems).toEqual([]);
    expect(finding.uncertaintyNote).toContain('database record');
  });

  it('returns INSUFFICIENT_EVIDENCE when the observed is empty', () => {
    const finding = compareIngredients('', 'Water, Sugar, Salt', 'HIGH');
    expect(finding.classification).toBe('INSUFFICIENT_EVIDENCE');
    expect(finding.observedItems).toEqual([]);
  });
});

describe('compareIngredients: low OCR confidence', () => {
  it('returns INSUFFICIENT_EVIDENCE even when the lists match', () => {
    const finding = compareIngredients(FIVE_A, FIVE_A, 'LOW');
    expect(finding.classification).toBe('INSUFFICIENT_EVIDENCE');
    expect(finding.uncertaintyNote).toContain('low confidence');
  });
});

describe('compareIngredients: too few items', () => {
  it('returns INSUFFICIENT_EVIDENCE when either side has fewer than three items', () => {
    const finding = compareIngredients('Water, Sugar', 'Water, Sugar', 'HIGH');
    expect(finding.classification).toBe('INSUFFICIENT_EVIDENCE');
    expect(finding.uncertaintyNote).toContain('fewer than three');
  });
});

describe('compareIngredients: brackets', () => {
  it('flattens bracketed sub-ingredients before comparing', () => {
    const observed = 'Sugar (sucrose, glucose), Water, Salt, Citric Acid';
    const reference = 'Sugar, Sucrose, Glucose, Water, Salt, Citric Acid';
    const finding = compareIngredients(observed, reference, 'HIGH');
    expect(finding.classification).toBe('CONSISTENT');
    expect(finding.observedItems).toEqual([
      'sugar',
      'sucrose',
      'glucose',
      'water',
      'salt',
      'citric acid',
    ]);
  });
});

describe('compareIngredients: percentages', () => {
  it('strips percentages and quantities before comparing', () => {
    const observed = 'Water 60%, Sugar 40%, Salt, Citric Acid';
    const reference = 'Water, Sugar, Salt, Citric Acid';
    const finding = compareIngredients(observed, reference, 'HIGH');
    expect(finding.classification).toBe('CONSISTENT');
    expect(finding.observedItems).toEqual(['water', 'sugar', 'salt', 'citric acid']);
  });
});

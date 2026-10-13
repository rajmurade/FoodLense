import { describe, expect, it } from 'vitest';
import {
  levenshtein,
  normalizeIngredients,
  normalizeItem,
  normalizeWhitespace,
  similarity,
} from '../normalize';

describe('normalizeWhitespace', () => {
  it('collapses runs of whitespace and trims', () => {
    expect(normalizeWhitespace('  Water   and\tSalt \n')).toBe('Water and Salt');
  });
});

describe('normalizeIngredients', () => {
  it('lowercases, splits on commas and semicolons, and trims items', () => {
    expect(normalizeIngredients('WATER, Sugar; Salt.')).toEqual(['water', 'sugar', 'salt']);
  });

  it('removes a leading "ingredients" word and a trailing full stop', () => {
    expect(normalizeIngredients('Ingredients: Water, Sugar, Salt.')).toEqual([
      'water',
      'sugar',
      'salt',
    ]);
  });

  it('flattens bracketed sub-ingredients into separate items', () => {
    expect(normalizeIngredients('Wheat flour (maida, refined), Water')).toEqual([
      'wheat flour',
      'maida',
      'refined',
      'water',
    ]);
  });

  it('handles nested brackets', () => {
    expect(normalizeIngredients('Oil (palm (refined), sunflower)')).toEqual([
      'oil',
      'palm',
      'refined',
      'sunflower',
    ]);
  });

  it('strips percentages and quantities', () => {
    expect(normalizeIngredients('Water 60%, Sugar 40%, Salt (1.5 g)')).toEqual([
      'water',
      'sugar',
      'salt',
    ]);
  });

  it('keeps INS and E numbers as items', () => {
    expect(normalizeIngredients('Water, Colour (INS 150d), E330')).toEqual([
      'water',
      'colour',
      'ins 150d',
      'e330',
    ]);
  });

  it('drops declaration phrases that are not ingredients', () => {
    expect(
      normalizeIngredients('Water, Sugar, Contains permitted natural colour, Salt'),
    ).toEqual(['water', 'sugar', 'salt']);
  });

  it('de-duplicates while keeping first-seen order', () => {
    expect(normalizeIngredients('Water, water, SUGAR, Salt, sugar')).toEqual([
      'water',
      'sugar',
      'salt',
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(normalizeIngredients('')).toEqual([]);
    expect(normalizeIngredients('   ')).toEqual([]);
  });
});

describe('normalizeItem', () => {
  it('removes punctuation and quantity units', () => {
    expect(normalizeItem('  Sugar (12%).  ')).toBe('sugar');
    expect(normalizeItem('Salt - 1.5 g')).toBe('salt');
  });
});

describe('levenshtein and similarity', () => {
  it('computes edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('sugar', 'sugar')).toBe(0);
  });

  it('returns 1 for identical or spelling-equivalent items', () => {
    expect(similarity('sugar', 'sugar')).toBe(1);
    expect(similarity('colour', 'color')).toBe(1);
    expect(similarity('natural flavour', 'natural flavor')).toBe(1);
  });

  it('returns a value below the threshold for clearly different items', () => {
    expect(similarity('water', 'palm oil')).toBeLessThan(0.5);
  });
});

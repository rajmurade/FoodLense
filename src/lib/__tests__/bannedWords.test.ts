import { describe, expect, it } from 'vitest';
import { uiStrings } from '../../data/uiStrings';
import { ALLOWED_DISCLAIMER_SENTENCES, BANNED_WORDS } from '../../data/bannedWords';

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, out);
  }
  return out;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wholeWordPattern(term: string): RegExp {
  const escaped = escapeRegExp(term).replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

function stripAllowedSentences(text: string): string {
  return ALLOWED_DISCLAIMER_SENTENCES.reduce(
    (acc, sentence) => acc.split(sentence).join(''),
    text,
  );
}

const checkedStrings = collectStrings(uiStrings);

describe('banned words in UI strings', () => {
  it('has UI strings to check', () => {
    expect(checkedStrings.length).toBeGreaterThan(0);
  });

  it('allowlists only the exact required disclaimer sentences', () => {
    expect(ALLOWED_DISCLAIMER_SENTENCES).toContain(uiStrings.footer.disclaimer);
    expect(ALLOWED_DISCLAIMER_SENTENCES).toContain(uiStrings.result.disclaimer);
  });

  it.each([...BANNED_WORDS])('does not contain the banned term "%s"', (term) => {
    const pattern = wholeWordPattern(term);
    const offenders = checkedStrings.filter((text) =>
      pattern.test(stripAllowedSentences(text)),
    );
    expect(offenders, `banned term "${term}" found in UI strings`).toEqual([]);
  });

  it('matches whole words only, so a shorter term does not match inside a longer one', () => {
    const safeTerm = BANNED_WORDS[0];
    const unsafeTerm = BANNED_WORDS[1];
    expect(wholeWordPattern(safeTerm).test(unsafeTerm.toLowerCase())).toBe(false);
    expect(wholeWordPattern(unsafeTerm).test(unsafeTerm.toLowerCase())).toBe(true);
  });

  it('still detects a standalone banned term next to an allowlisted sentence', () => {
    const unsafeTerm = BANNED_WORDS[1];
    const sample = `${uiStrings.result.disclaimer} This product is ${unsafeTerm}.`;
    expect(stripAllowedSentences(sample)).not.toContain(uiStrings.result.disclaimer);
    expect(wholeWordPattern(unsafeTerm).test(stripAllowedSentences(sample))).toBe(true);
  });
});

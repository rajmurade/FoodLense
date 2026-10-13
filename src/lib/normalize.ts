import { DECLARATION_PHRASES, SPELLING_VARIANTS } from './constants';

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function normalizeItem(item: string): string {
  return item
    .toLowerCase()
    .replace(/[^a-z0-9%.,()\s-]/g, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\s*%/g, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:mg|kg|mcg|µg|ml|gm|g|l|iu)\b\.?/g, ' ')
    .replace(/%/g, ' ')
    .replace(/[.,;:()\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDeclarationPhrase(item: string): boolean {
  return DECLARATION_PHRASES.some((phrase) => item.includes(phrase));
}

function splitOutsideBrackets(text: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of text) {
    if (char === '(') {
      depth += 1;
      current += char;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
      current += char;
    } else if ((char === ',' || char === ';') && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  parts.push(current);
  return parts;
}

function splitBrackets(part: string): { outer: string; inner: string[] } {
  let outer = '';
  const inner: string[] = [];
  let i = 0;

  while (i < part.length) {
    const char = part[i];

    if (char === '(') {
      let depth = 1;
      let j = i + 1;
      let content = '';
      while (j < part.length && depth > 0) {
        const nested = part[j];
        if (nested === '(') {
          depth += 1;
        } else if (nested === ')') {
          depth -= 1;
          if (depth === 0) {
            break;
          }
        }
        content += nested;
        j += 1;
      }
      inner.push(content);
      i = j + 1;
    } else {
      outer += char;
      i += 1;
    }
  }

  return { outer, inner };
}

function collectItems(segment: string, out: string[]): void {
  for (const part of splitOutsideBrackets(segment)) {
    const { outer, inner } = splitBrackets(part);
    if (outer.trim()) {
      out.push(outer);
    }
    for (const sub of inner) {
      collectItems(sub, out);
    }
  }
}

export function normalizeIngredients(text: string): string[] {
  let working = text.toLowerCase();
  working = working.replace(/[[{]/g, '(').replace(/[\]}]/g, ')');
  working = working.replace(/[–—]/g, '-');
  working = normalizeWhitespace(working);
  working = working.replace(/^ingredients?\b\s*[:\-]?\s*/i, '');
  working = working.replace(/[.\s]+$/, '');

  const rawItems: string[] = [];
  collectItems(working, rawItems);

  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawItems) {
    const normalized = normalizeItem(raw);
    if (!normalized || isDeclarationPhrase(normalized) || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[b.length];
}

function canonicalize(text: string): string {
  return text
    .split(' ')
    .map((word) => SPELLING_VARIANTS[word] ?? word)
    .join(' ');
}

export function similarity(a: string, b: string): number {
  const left = canonicalize(a);
  const right = canonicalize(b);
  if (left === right) {
    return 1;
  }
  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) {
    return 1;
  }
  return 1 - levenshtein(left, right) / maxLength;
}

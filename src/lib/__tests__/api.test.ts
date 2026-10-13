import { describe, expect, it, vi } from 'vitest';
import { buildUpstreamUrl, lookupProduct, toUpstreamBarcode } from '../api';
import type { CacheEntry, LookupDeps, ProductCache, ProductContent } from '../api';

const BARCODE = '4006381333931';
const USER_AGENT = 'FoodCheck/1.0 (test@example.com)';
const FIXED_NOW = 1_700_000_000_000;

const sampleProduct = {
  product_name: 'Sample Product, simulated test',
  brands: 'Sample Brand',
  quantity: '100 g',
  ingredients_text: 'Water, Sugar, Salt',
  countries_tags: ['en:india'],
  labels_tags: ['en:vegetarian'],
  image_front_url: 'https://example.org/sample.jpg',
  last_modified_t: 1_700_000_000,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function asFetch(
  fn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): typeof fetch {
  return fn as unknown as typeof fetch;
}

const hangingFetch = asFetch(
  (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }),
);

class MemoryCache implements ProductCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(initial?: Record<string, CacheEntry>) {
    if (initial) {
      for (const [key, value] of Object.entries(initial)) {
        this.entries.set(key, value);
      }
    }
  }

  async get(barcode: string): Promise<CacheEntry | null> {
    return this.entries.get(barcode) ?? null;
  }

  async set(barcode: string, entry: CacheEntry): Promise<void> {
    this.entries.set(barcode, entry);
  }
}

function sampleContent(overrides: Partial<ProductContent> = {}): ProductContent {
  return {
    barcode: BARCODE,
    found: true,
    product: {
      name: 'Sample Product, simulated test',
      brand: 'Sample Brand',
      quantity: '100 g',
      ingredientsText: 'Water, Sugar, Salt',
      countries: ['en:india'],
      labels: ['en:vegetarian'],
      imageUrl: 'https://example.org/sample.jpg',
      lastModified: null,
    },
    barcodeChecks: { format: 'EAN13', checksumValid: true, prefixIndia: false },
    source: 'openfoodfacts',
    retrievedAt: new Date(FIXED_NOW).toISOString(),
    ...overrides,
  };
}

function makeDeps(overrides: Partial<LookupDeps> & Pick<LookupDeps, 'fetch' | 'cache'>): LookupDeps {
  return {
    userAgent: USER_AGENT,
    now: () => FIXED_NOW,
    timeoutMs: 5,
    retryBackoffMs: 0,
    sleep: async () => undefined,
    ...overrides,
  };
}

describe('toUpstreamBarcode', () => {
  it('pads UPC-A to 13 digits and leaves EAN formats unchanged', () => {
    expect(toUpstreamBarcode('036000291452', 'UPCA')).toBe('0036000291452');
    expect(toUpstreamBarcode('4006381333931', 'EAN13')).toBe('4006381333931');
    expect(toUpstreamBarcode('96385074', 'EAN8')).toBe('96385074');
  });
});

describe('lookupProduct: UPC-A handling', () => {
  it('queries the upstream and cache key with the 13-digit padded barcode', async () => {
    const upc = '036000291452';
    let calledUrl = '';
    const fetchMock = asFetch(async (input) => {
      calledUrl = String(input);
      return jsonResponse({ status: 1, product: sampleProduct });
    });
    const cache = new MemoryCache();

    const result = await lookupProduct(upc, makeDeps({ fetch: fetchMock, cache }));

    expect(calledUrl).toBe(buildUpstreamUrl('0036000291452'));
    expect(calledUrl).toContain('/product/0036000291452.json');
    expect(await cache.get('0036000291452')).not.toBeNull();
    expect(await cache.get(upc)).toBeNull();
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.body.barcode).toBe(upc);
    }
  });
});

describe('lookupProduct: mocked upstream', () => {
  it('returns a normalised record when Open Food Facts reports status 1', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 1, product: sampleProduct }));
    const cache = new MemoryCache();

    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache }),
    );

    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.found).toBe(true);
    expect(result.body.source).toBe('openfoodfacts');
    expect(result.body.fromCache).toBe(false);
    expect(result.body.stale).toBe(false);
    expect(result.body.retrievedAt).toBe(new Date(FIXED_NOW).toISOString());
    expect(result.body.product).toEqual({
      name: 'Sample Product, simulated test',
      brand: 'Sample Brand',
      quantity: '100 g',
      ingredientsText: 'Water, Sugar, Salt',
      countries: ['en:india'],
      labels: ['en:vegetarian'],
      imageUrl: 'https://example.org/sample.jpg',
      lastModified: new Date(1_700_000_000 * 1000).toISOString(),
    });
    expect(await cache.get(BARCODE)).not.toBeNull();
  });

  it('returns found:false with product:null when status is 0', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 0 }));
    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache: new MemoryCache() }),
    );

    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.found).toBe(false);
    expect(result.body.product).toBeNull();
  });

  it('treats an HTTP 404 as not found', async () => {
    const fetchMock = vi.fn(async () => new Response('', { status: 404 }));
    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache: new MemoryCache() }),
    );

    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.found).toBe(false);
  });

  it('fills missing fields with null or empty arrays instead of inventing data', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ status: 1, product: { product_name: 'Only a name' } }),
    );
    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache: new MemoryCache() }),
    );

    expect(result.status).toBe(200);
    if (result.status !== 200 || !result.body.product) return;
    expect(result.body.product).toEqual({
      name: 'Only a name',
      brand: null,
      quantity: null,
      ingredientsText: null,
      countries: [],
      labels: [],
      imageUrl: null,
      lastModified: null,
    });
  });

  it('retries once after a timeout and then succeeds', async () => {
    let calls = 0;
    const fetchMock = asFetch(async () => {
      calls += 1;
      if (calls === 1) {
        return new Promise<Response>(() => undefined);
      }
      return jsonResponse({ status: 1, product: sampleProduct });
    });

    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: fetchMock, cache: new MemoryCache() }),
    );

    expect(calls).toBe(2);
    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.found).toBe(true);
    expect(result.body.stale).toBe(false);
  });

  it('retries once after a 5xx and then succeeds', async () => {
    let calls = 0;
    const fetchMock = asFetch(async () => {
      calls += 1;
      if (calls === 1) {
        return new Response('', { status: 503 });
      }
      return jsonResponse({ status: 1, product: sampleProduct });
    });

    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: fetchMock, cache: new MemoryCache() }),
    );

    expect(calls).toBe(2);
    expect(result.status).toBe(200);
  });

  it('serves a stale cached copy when the upstream times out and a cache entry exists', async () => {
    const cache = new MemoryCache({
      [BARCODE]: { content: sampleContent(), expiresAt: FIXED_NOW - 1 },
    });

    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: hangingFetch, cache }),
    );

    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.fromCache).toBe(true);
    expect(result.body.stale).toBe(true);
    expect(result.body.found).toBe(true);
  });

  it('returns UPSTREAM_UNAVAILABLE when the upstream times out with no cache', async () => {
    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: hangingFetch, cache: new MemoryCache() }),
    );

    expect(result.status).toBe(503);
    if (result.status !== 503) return;
    expect(result.body.error.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('does not retry on malformed upstream JSON', async () => {
    const fetchMock = vi.fn(async () => new Response('<html>nope</html>', { status: 200 }));
    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache: new MemoryCache() }),
    );

    expect(result.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns RATE_LIMITED on HTTP 429 without retrying', async () => {
    const fetchMock = vi.fn(async () => new Response('', { status: 429 }));
    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache: new MemoryCache() }),
    );

    expect(result.status).toBe(429);
    if (result.status !== 429) return;
    expect(result.body.error.code).toBe('RATE_LIMITED');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('serves a fresh cache hit without calling the upstream', async () => {
    const cache = new MemoryCache({
      [BARCODE]: { content: sampleContent(), expiresAt: FIXED_NOW + 10_000 },
    });
    const fetchMock = vi.fn(async () => jsonResponse({ status: 1, product: sampleProduct }));

    const result = await lookupProduct(
      BARCODE,
      makeDeps({ fetch: asFetch(fetchMock), cache }),
    );

    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.fromCache).toBe(true);
    expect(result.body.stale).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid barcode before any network call', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 1 }));
    const result = await lookupProduct(
      '12345',
      makeDeps({ fetch: asFetch(fetchMock), cache: new MemoryCache() }),
    );

    expect(result.status).toBe(422);
    if (result.status !== 422) return;
    expect(result.body.error.code).toBe('INVALID_BARCODE');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls only the fixed Open Food Facts URL with the configured User-Agent', async () => {
    let calledUrl = '';
    let calledInit: RequestInit | undefined;
    const fetchMock = asFetch(async (input, init) => {
      calledUrl = String(input);
      calledInit = init;
      return jsonResponse({ status: 1, product: sampleProduct });
    });

    await lookupProduct(BARCODE, makeDeps({ fetch: fetchMock, cache: new MemoryCache() }));

    expect(calledUrl).toBe(buildUpstreamUrl(BARCODE));
    expect(calledUrl.startsWith('https://world.openfoodfacts.org/api/v2/product/')).toBe(true);
    const headers = calledInit?.headers as Record<string, string>;
    expect(headers['User-Agent']).toBe(USER_AGENT);
  });
});

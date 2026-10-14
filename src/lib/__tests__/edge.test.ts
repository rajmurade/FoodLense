import { describe, expect, it } from 'vitest';
import { handleProductLookup, matchProductBarcode } from '../edge';

describe('matchProductBarcode', () => {
  it('matches /api/product/:barcode with and without a trailing slash', () => {
    expect(matchProductBarcode('/api/product/4006381333931')).toBe('4006381333931');
    expect(matchProductBarcode('/api/product/4006381333931/')).toBe('4006381333931');
  });

  it('decodes an encoded barcode segment', () => {
    expect(matchProductBarcode('/api/product/4006%2038')).toBe('4006 38');
  });

  it('ignores other routes', () => {
    expect(matchProductBarcode('/api/product/')).toBeNull();
    expect(matchProductBarcode('/api/product/1/extra')).toBeNull();
    expect(matchProductBarcode('/product/4006381333931')).toBeNull();
    expect(matchProductBarcode('/')).toBeNull();
  });
});

describe('handleProductLookup', () => {
  it('returns the one error shape when the User-Agent is missing', async () => {
    const response = await handleProductLookup({
      request: new Request('https://example.test/api/product/4006381333931'),
      barcode: '4006381333931',
      env: { OFF_USER_AGENT: '', ALLOWED_ORIGIN: 'https://example.test' },
      fetchImpl: async () => new Response('', { status: 500 }),
    });

    expect(response.status).toBe(500);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.test');
    expect(await response.json()).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Server is not configured.' },
    });
  });

  it('rejects an invalid barcode without calling upstream', async () => {
    let called = false;
    const response = await handleProductLookup({
      request: new Request('https://example.test/api/product/12345'),
      barcode: '12345',
      env: { OFF_USER_AGENT: 'FoodCheck/test' },
      fetchImpl: async () => {
        called = true;
        return new Response('', { status: 200 });
      },
    });

    expect(called).toBe(false);
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: { code: 'INVALID_BARCODE', message: 'Barcode must be 8, 12 or 13 digits.' },
    });
  });

  it('passes a found=false body through for an upstream 404', async () => {
    const response = await handleProductLookup({
      request: new Request('https://example.test/api/product/4006381333931'),
      barcode: '4006381333931',
      env: { OFF_USER_AGENT: 'FoodCheck/test' },
      fetchImpl: async () => new Response(JSON.stringify({ status: 0 }), { status: 404 }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { barcode: string; found: boolean };
    expect(body.barcode).toBe('4006381333931');
    expect(body.found).toBe(false);
  });
});

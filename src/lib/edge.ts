import { lookupProduct } from './api';
import type { CacheEntry, ProductCache } from './api';

export interface EdgeEnv {
  OFF_USER_AGENT?: string;
  ALLOWED_ORIGIN?: string;
}

const CACHE_PATH_PREFIX = '/__product_lookup_cache/';
const PRODUCT_PATH = /^\/api\/product\/([^/]+)\/?$/;

export interface EdgeCacheStore {
  match(request: string): Promise<Response | undefined>;
  put(request: string, response: Response): Promise<void>;
}

export function matchProductBarcode(pathname: string): string | null {
  const match = PRODUCT_PATH.exec(pathname);

  if (!match) {
    return null;
  }

  const raw = match[1];

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function cacheKey(request: Request, barcode: string): string {
  const url = new URL(request.url);
  url.pathname = `${CACHE_PATH_PREFIX}${barcode}`;
  url.search = '';
  return url.toString();
}

function defaultCacheStore(): EdgeCacheStore | undefined {
  return (globalThis as unknown as { caches?: { default?: EdgeCacheStore } }).caches?.default;
}

export function createProductCache(request: Request, store?: EdgeCacheStore): ProductCache {
  if (!store) {
    return {
      async get() {
        return null;
      },
      async set() {
        return undefined;
      },
    };
  }

  return {
    async get(barcode) {
      const hit = await store.match(cacheKey(request, barcode));
      if (!hit) {
        return null;
      }
      try {
        return (await hit.json()) as CacheEntry;
      } catch {
        return null;
      }
    },
    async set(barcode, entry) {
      const ttlSeconds = Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000));
      await store.put(
        cacheKey(request, barcode),
        new Response(JSON.stringify(entry), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': `max-age=${ttlSeconds}`,
          },
        }),
      );
    },
  };
}

export function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export interface ProductLookupContext {
  request: Request;
  barcode: string | undefined;
  env: EdgeEnv;
  fetchImpl?: typeof fetch;
  cacheStore?: EdgeCacheStore;
}

export async function handleProductLookup(context: ProductLookupContext): Promise<Response> {
  const origin = context.env.ALLOWED_ORIGIN ?? null;
  const userAgent = context.env.OFF_USER_AGENT;

  if (!userAgent) {
    return jsonResponse(
      { error: { code: 'INTERNAL_ERROR', message: 'Server is not configured.' } },
      500,
      origin,
    );
  }

  try {
    const result = await lookupProduct(context.barcode ?? '', {
      fetch: context.fetchImpl ?? fetch,
      cache: createProductCache(context.request, context.cacheStore ?? defaultCacheStore()),
      userAgent,
    });
    return jsonResponse(result.body, result.status, origin);
  } catch {
    return jsonResponse(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong. Please try again.',
        },
      },
      500,
      origin,
    );
  }
}

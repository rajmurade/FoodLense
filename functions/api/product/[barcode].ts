import { lookupProduct } from '../../../src/lib/api';
import type { CacheEntry, ProductCache } from '../../../src/lib/api';

interface Env {
  OFF_USER_AGENT?: string;
  ALLOWED_ORIGIN?: string;
}

interface EventContext {
  request: Request;
  env: Env;
  params: { barcode?: string };
}

const CACHE_PATH_PREFIX = '/__product_lookup_cache/';

function cacheKey(request: Request, barcode: string): string {
  const url = new URL(request.url);
  url.pathname = `${CACHE_PATH_PREFIX}${barcode}`;
  url.search = '';
  return url.toString();
}

interface EdgeCache {
  match(request: string): Promise<Response | undefined>;
  put(request: string, response: Response): Promise<void>;
}

function createCache(request: Request): ProductCache {
  const cacheStorage = (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches;
  const store = cacheStorage?.default;

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

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export const onRequestGet = async (context: EventContext): Promise<Response> => {
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
    const result = await lookupProduct(context.params.barcode ?? '', {
      fetch,
      cache: createCache(context.request),
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
};

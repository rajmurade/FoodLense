import { validateBarcode } from './barcode';
import type { BarcodeChecks, BarcodeFormat } from './barcode';

export interface ProductRecord {
  name: string | null;
  brand: string | null;
  quantity: string | null;
  ingredientsText: string | null;
  countries: string[];
  labels: string[];
  imageUrl: string | null;
  lastModified: string | null;
}

export interface ProductContent {
  barcode: string;
  found: boolean;
  product: ProductRecord | null;
  barcodeChecks: BarcodeChecks;
  source: 'openfoodfacts';
  retrievedAt: string;
}

export interface ProductResponse extends ProductContent {
  fromCache: boolean;
  stale: boolean;
}

export type ErrorCode =
  | 'INVALID_BARCODE'
  | 'RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: { code: ErrorCode; message: string };
}

export type LookupResult =
  | { status: 200; body: ProductResponse }
  | { status: 422 | 429 | 503 | 500; body: ApiErrorBody };

export interface CacheEntry {
  content: ProductContent;
  expiresAt: number;
}

export interface ProductCache {
  get(barcode: string): Promise<CacheEntry | null>;
  set(barcode: string, entry: CacheEntry): Promise<void>;
}

export interface LookupDeps {
  fetch: typeof fetch;
  cache: ProductCache;
  userAgent: string;
  now?: () => number;
  timeoutMs?: number;
  retryBackoffMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const OFF_HOST = 'https://world.openfoodfacts.org';

const OFF_FIELDS = [
  'code',
  'product_name',
  'brands',
  'quantity',
  'ingredients_text',
  'countries_tags',
  'labels_tags',
  'image_front_url',
  'last_modified_t',
].join(',');

const FOUND_TTL_MS = 24 * 60 * 60 * 1000;
const NOT_FOUND_TTL_MS = 60 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRY_BACKOFF_MS = 300;

const UPSTREAM_ERROR_MESSAGE = 'Open Food Facts is unavailable right now. Please try again.';
const RATE_LIMITED_MESSAGE =
  'Open Food Facts is rate limiting requests. Please try again later.';

export function toUpstreamBarcode(barcode: string, format: BarcodeFormat): string {
  return format === 'UPCA' ? `0${barcode}` : barcode;
}

export function buildUpstreamUrl(barcode: string): string {
  const params = new URLSearchParams({ fields: OFF_FIELDS });
  return `${OFF_HOST}/api/v2/product/${barcode}.json?${params.toString()}`;
}

export async function lookupProduct(
  rawBarcode: string,
  deps: LookupDeps,
): Promise<LookupResult> {
  const validation = validateBarcode(rawBarcode);

  if (!validation.valid) {
    return {
      status: 422,
      body: { error: { code: 'INVALID_BARCODE', message: validation.message } },
    };
  }

  const { barcode, checks } = validation;
  const lookupCode = toUpstreamBarcode(barcode, checks.format);
  const now = deps.now ?? Date.now;
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retryBackoffMs = deps.retryBackoffMs ?? DEFAULT_RETRY_BACKOFF_MS;
  const sleep = deps.sleep ?? defaultSleep;

  const cached = await deps.cache.get(lookupCode);
  const nowMs = now();

  if (cached && cached.expiresAt > nowMs) {
    return { status: 200, body: { ...cached.content, fromCache: true, stale: false } };
  }

  const url = buildUpstreamUrl(lookupCode);
  const init: RequestInit = {
    headers: { 'User-Agent': deps.userAgent, Accept: 'application/json' },
  };

  let upstream: Response | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      upstream = await fetchWithTimeout(deps.fetch, url, init, timeoutMs);
    } catch {
      if (attempt === 0) {
        await sleep(retryBackoffMs);
        continue;
      }
      return staleOrUnavailable(cached);
    }

    if (upstream.status === 429) {
      return {
        status: 429,
        body: { error: { code: 'RATE_LIMITED', message: RATE_LIMITED_MESSAGE } },
      };
    }

    if (upstream.status >= 500) {
      if (attempt === 0) {
        await sleep(retryBackoffMs);
        continue;
      }
      return staleOrUnavailable(cached);
    }

    if (!upstream.ok && upstream.status !== 404) {
      return staleOrUnavailable(cached);
    }

    break;
  }

  if (!upstream) {
    return staleOrUnavailable(cached);
  }

  const retrievedAt = new Date(nowMs).toISOString();

  let content: ProductContent;

  if (upstream.status === 404) {
    content = notFoundContent(barcode, checks, retrievedAt);
  } else {
    let json: unknown;
    try {
      json = await upstream.json();
    } catch {
      return staleOrUnavailable(cached);
    }
    try {
      content = normaliseProductJson(barcode, checks, json, retrievedAt);
    } catch {
      return staleOrUnavailable(cached);
    }
  }

  const ttl = content.found ? FOUND_TTL_MS : NOT_FOUND_TTL_MS;
  await deps.cache.set(lookupCode, { content, expiresAt: nowMs + ttl });

  return { status: 200, body: { ...content, fromCache: false, stale: false } };
}

function staleOrUnavailable(cached: CacheEntry | null): LookupResult {
  if (cached) {
    return { status: 200, body: { ...cached.content, fromCache: true, stale: true } };
  }
  return {
    status: 503,
    body: { error: { code: 'UPSTREAM_UNAVAILABLE', message: UPSTREAM_ERROR_MESSAGE } },
  };
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Upstream request timed out'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      fetchImpl(url, { ...init, signal: controller.signal }),
      timeout,
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

function notFoundContent(
  barcode: string,
  checks: BarcodeChecks,
  retrievedAt: string,
): ProductContent {
  return {
    barcode,
    found: false,
    product: null,
    barcodeChecks: checks,
    source: 'openfoodfacts',
    retrievedAt,
  };
}

function normaliseProductJson(
  barcode: string,
  checks: BarcodeChecks,
  json: unknown,
  retrievedAt: string,
): ProductContent {
  if (!isRecord(json)) {
    throw new Error('Malformed upstream response');
  }

  const status = json.status;

  if (status === 0 || status === '0') {
    return notFoundContent(barcode, checks, retrievedAt);
  }

  if (status !== 1 && status !== '1') {
    throw new Error('Malformed upstream response');
  }

  const product = json.product;

  if (!isRecord(product)) {
    throw new Error('Malformed upstream response');
  }

  return {
    barcode,
    found: true,
    product: {
      name: toNullableString(product.product_name),
      brand: toNullableString(product.brands),
      quantity: toNullableString(product.quantity),
      ingredientsText: toNullableString(product.ingredients_text),
      countries: toStringArray(product.countries_tags),
      labels: toStringArray(product.labels_tags),
      imageUrl: toNullableString(product.image_front_url),
      lastModified: toIsoFromUnixSeconds(product.last_modified_t),
    },
    barcodeChecks: checks,
    source: 'openfoodfacts',
    retrievedAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function toIsoFromUnixSeconds(value: unknown): string | null {
  let seconds: number | null = null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    seconds = value;
  } else if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    seconds = Number(value.trim());
  }

  if (seconds === null) {
    return null;
  }

  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

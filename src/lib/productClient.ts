import type { ApiErrorBody, ErrorCode, ProductResponse } from './api';

export type ProductFetchResult =
  | { ok: true; data: ProductResponse }
  | { ok: false; error: { code: ErrorCode; message: string } };

const UNREACHABLE_MESSAGE = 'Could not reach the lookup service. Please try again.';
const UNEXPECTED_MESSAGE = 'The lookup service returned an unexpected response.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isProductResponse(value: unknown): value is ProductResponse {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.barcode === 'string' && typeof value.found === 'boolean';
}

function extractError(value: unknown): ApiErrorBody['error'] | null {
  if (!isRecord(value)) {
    return null;
  }
  const error = value.error;
  if (!isRecord(error) || typeof error.code !== 'string' || typeof error.message !== 'string') {
    return null;
  }
  return { code: error.code as ErrorCode, message: error.message };
}

export async function fetchProduct(barcode: string): Promise<ProductFetchResult> {
  try {
    const response = await fetch(`/api/product/${encodeURIComponent(barcode)}`, {
      headers: { Accept: 'application/json' },
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: extractError(payload) ?? { code: 'UPSTREAM_UNAVAILABLE', message: UNREACHABLE_MESSAGE },
      };
    }

    if (!isProductResponse(payload)) {
      return { ok: false, error: { code: 'INTERNAL_ERROR', message: UNEXPECTED_MESSAGE } };
    }

    return { ok: true, data: payload };
  } catch {
    return { ok: false, error: { code: 'UPSTREAM_UNAVAILABLE', message: UNREACHABLE_MESSAGE } };
  }
}

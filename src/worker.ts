import { handleProductLookup, jsonResponse, matchProductBarcode } from './lib/edge';
import type { EdgeEnv } from './lib/edge';

export interface Env extends EdgeEnv {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN ?? null;
    const barcode = matchProductBarcode(url.pathname);

    if (barcode !== null) {
      if (request.method !== 'GET') {
        return jsonResponse(
          { error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is supported.' } },
          405,
          origin,
        );
      }
      return handleProductLookup({ request, barcode, env });
    }

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return jsonResponse(
        { error: { code: 'NOT_FOUND', message: 'Not found.' } },
        404,
        origin,
      );
    }

    return env.ASSETS.fetch(request);
  },
};

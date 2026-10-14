import { handleProductLookup } from '../../../src/lib/edge';
import type { EdgeEnv } from '../../../src/lib/edge';

interface EventContext {
  request: Request;
  env: EdgeEnv;
  params: { barcode?: string };
}

export const onRequestGet = (context: EventContext): Promise<Response> =>
  handleProductLookup({
    request: context.request,
    barcode: context.params.barcode,
    env: context.env,
  });

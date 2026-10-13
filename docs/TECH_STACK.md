# TECH_STACK.md: FoodCheck v1.0

Principle: fewest moving parts that satisfy `specs.md`. No database, no accounts, no paid APIs. Pin versions in the lockfile; do not guess version numbers.

## 1. Summary

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast setup, good tooling |
| Styling | Tailwind CSS | Quick mobile-first UI |
| Routing | React Router | 7 simple routes |
| Barcode decoding | `@zxing/browser` (native `BarcodeDetector` only as an optional bonus) | Works on Android and iOS Safari |
| OCR | `tesseract.js`, in the browser | Free, photo never leaves the device |
| Fuzzy matching | small in-repo function (normalised Levenshtein) or `fastest-levenshtein` | Deterministic, testable |
| Server | One serverless function: product lookup proxy + cache | Sets the required User-Agent, validates input, normalises errors |
| Hosting | Cloudflare Pages + Pages Functions (alternative: Vercel) | Free tier, HTTPS by default (camera needs HTTPS) |
| Database | **None** | Spec forbids adding one without a need |
| Local storage | `localStorage` for scan history (P1), wrapped in try/catch | No server-side user data |
| Tests | Vitest (unit); manual device tests | Cover the logic that matters |
| Package manager | npm (or pnpm), Node 20+ | |

## 2. External API: Open Food Facts (product read)

- Production host: `https://world.openfoodfacts.org` (their `.net` host is a test environment; do not use it for the demo).
- Request: `GET /api/v2/product/{barcode}.json?fields=code,product_name,brands,quantity,ingredients_text,countries_tags,labels_tags,image_front_url,last_modified_t`
- No API key. Reads require a **custom User-Agent**: `FoodCheck/1.0 (your-email@example.com)`. Keep this in an environment variable.
- Rate limits are enforced per endpoint; read their current docs before any load test. Cache every result.
- Licence: ODbL. Show "Source: Open Food Facts contributors". Do not merge their data into another database you redistribute.
- Response: `status` 1 = found, 0 = not found (a 404 may also occur). Treat both as "not found". Never index fields directly; default missing ones.
- Docs: `https://openfoodfacts.github.io/openfoodfacts-server/api/` (mentions a v3 API too; v2 product read is widely used, verify with `curl` first).

Verification command to run before coding:
```
curl -A "FoodCheck/1.0 (you@example.com)" \
 "https://world.openfoodfacts.org/api/v2/product/<BARCODE>.json?fields=code,product_name,ingredients_text"
```

## 3. Not used (and why)

| Thing | Reason |
|---|---|
| FSSAI licence "API" or scrapers | No public official API found; FoSCoS uses a captcha; scrapers imitate encrypted portal calls. Link out only |
| Any LLM API | Not needed; comparison is deterministic. Avoids cost, key handling and invented content |
| Paid verification APIs, GS1 DataKart | Partnership/commercial; future scope |
| Database, auth, accounts | Out of scope for v1.0 |
| Cloud OCR (Google Vision, etc.) | Would upload user photos to a third party |

## 4. Our API contract

One endpoint.

`GET /api/product/:barcode`

Success (200):
```json
{
  "barcode": "8901234567890",
  "found": true,
  "product": {
    "name": "string|null", "brand": "string|null", "quantity": "string|null",
    "ingredientsText": "string|null",
    "countries": ["en:india"], "labels": [],
    "imageUrl": "https://...|null", "lastModified": "ISO date|null"
  },
  "barcodeChecks": { "format": "EAN13|EAN8|UPCA", "checksumValid": true, "prefixIndia": true },
  "source": "openfoodfacts",
  "retrievedAt": "ISO datetime",
  "fromCache": false,
  "stale": false
}
```
Not found (200): same shape with `"found": false, "product": null`.

Errors (non-2xx), one shape:
```json
{ "error": { "code": "INVALID_BARCODE", "message": "Barcode must be 8, 12 or 13 digits." } }
```
Codes: `INVALID_BARCODE` (422), `RATE_LIMITED` (429), `UPSTREAM_UNAVAILABLE` (503), `INTERNAL_ERROR` (500, generic message, no stack).

Function logic:
1. Strip spaces; validate length/digits/checksum; reject early.
2. Look in cache (found: 24 h; not found: 1 h).
3. Call Open Food Facts with a 5 s timeout; one retry on timeout/5xx with ~300 ms backoff.
4. Normalise to the shape above; store in cache.
5. On upstream failure, serve a stale cached copy with `"stale": true` if one exists, else return `UPSTREAM_UNAVAILABLE`.

Cache: Cloudflare Cache API (or in-memory per instance as a fallback). No persistent store.

## 5. Shared types (TypeScript)

```ts
type Classification = "CONSISTENT" | "POTENTIAL_DISCREPANCY" | "INSUFFICIENT_EVIDENCE";
type OcrConfidence = "LOW" | "MEDIUM" | "HIGH";

interface Finding {
  id: string;
  type: "ingredient_list";
  observedItems: string[];
  referenceItems: string[];
  matched: string[];
  onlyOnLabel: string[];
  onlyInRecord: string[];
  orderDiffers: boolean;
  classification: Classification;
  uncertaintyNote: string;
  sources: { observed: string; reference: string; retrievedAt: string };
  method: string;
  explanation: string;
}
```
Keep `compareIngredients`, barcode validation and normalisation in `src/lib/` as pure functions with unit tests. No React imports inside `src/lib/`.

## 6. Repository layout

```
/
  AGENTS.md
  docs/            specs.md, TECH_STACK.md, UI_UX.md, FOODLENS_PLAN.md
  functions/api/product/[barcode].ts   serverless lookup
  public/          icons, _headers
  src/
    main.tsx  App.tsx
    pages/       Home Scan Product Label Result Help About Guide History
    components/  Header StepProgress Footer BarcodeScanner BarcodeInput
                 ProductCard ImagePicker OcrProgress TextReview
                 ConfidenceLabel FindingCard ClassificationBadge
                 ErrorBanner Loading
    lib/         barcode.ts  normalize.ts  compare.ts  ocr.ts  api.ts  storage.ts
    lib/__tests__/
    data/        guide content, banned-words list
```

## 7. Environment variables

| Name | Where | Purpose |
|---|---|---|
| `OFF_USER_AGENT` | Server function only | Custom User-Agent for Open Food Facts |
| `ALLOWED_ORIGIN` | Server function | CORS (if frontend and function are on different origins) |

No secrets in the frontend bundle. `.env*` in `.gitignore`. Commit a `.env.example` with names only.

## 8. Security configuration

- Validate every input server-side; never build an upstream URL from user text other than the validated digits-only barcode.
- CORS limited to the app origin.
- Security headers in `public/_headers`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a conservative `Content-Security-Policy` (allow only self and the OCR/ZXing assets you actually use; test the camera and OCR still work), `Permissions-Policy: camera=(self)`.
- Rate limiting via Cloudflare rules on `/api/*`.
- Treat OCR text and database text as untrusted; render as text, never as HTML (no `dangerouslySetInnerHTML`).
- Images: client-side only; validate type and size; never log image contents.
- Run `npm audit` and check git history for committed secrets before deploying.
- Security-audit skill: run only after P0 works and is committed; review each finding yourself, fix, re-test.

## 9. OCR notes

- `tesseract.js` downloads language data on first use. Test on the demo network, or self-host the worker, core and `eng.traineddata` under `/public` and point the library to them.
- Resize large photos on a canvas before OCR (max 1600 px long side).
- Use the OCR confidence value the engine returns to set Low/Medium/High; the thresholds are starting values to tune on real packs.
- Run OCR in a worker so the UI stays responsive.

## 10. Deployment

1. Push to GitHub.
2. Create a Cloudflare Pages project from the repo (build: `npm run build`, output: `dist`). Functions in `/functions` deploy with it.
3. Set `OFF_USER_AGENT` (and `ALLOWED_ORIGIN` if needed) in project settings.
4. Open the deployed HTTPS URL on a real phone: check camera permission, a lookup, an OCR run.
5. Smoke test: unknown barcode, bad file type, offline banner.
6. Keep a screen recording and screenshots as a fallback for the demo.

Fallback if Cloudflare setup causes trouble: Vercel with an `/api` function using the same code.

## 11. Dependency policy

Prefer maintained libraries over custom code; add none that are not needed. Do not add a second library for something one already handles. Record why each dependency exists in the README.

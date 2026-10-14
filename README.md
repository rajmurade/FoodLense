# FoodCheck

Mobile-first web app that compares a packaged food's printed ingredient list (read from a
photo with in-browser OCR) with its Open Food Facts record, and reports one of three
classifications: **Consistent with available records**, **Potential discrepancy**, or
**Insufficient evidence**. It is not a lab test and never judges safety or authenticity.

Prototype v1.0 for a college Community Engagement Project.

## Status

**P0 steps 1-10 complete. P1 has not been started.** The list below separates what is
implemented, what is incomplete, what is simulated, and the known limitations.

### Implemented

Shell/routing (header, tab bar, footer disclaimer, skip link), and the Home page
(`src/pages/Home.tsx`, `docs/UI_UX.md` §4.2: tagline, Scan / Type / Guide / Official-help
actions, the three-step "How it works" list and the required note; no greeting).

- Barcode: `src/lib/barcode.ts` (EAN-13/EAN-8/UPC-A validation, UPC-A padded to 13 digits for
  upstream lookups).
- Product lookup: `src/lib/api.ts` (validate → cache → Open Food Facts fetch with 5 s timeout,
  one retry on timeout/5xx, normalise, cache, stale-on-failure), shared edge adapter
  `src/lib/edge.ts`, Worker entry `src/worker.ts`, Pages Function
  `functions/api/product/[barcode].ts`.
- Product page + `src/lib/productClient.ts` (loading / found / not-found / no-ingredients /
  upstream-error states).
- Normalise + compare: `src/lib/normalize.ts`, `src/lib/compare.ts`, `src/lib/constants.ts`
  (comparison thresholds, declaration phrases, spelling variants).
- Label flow: `src/lib/imageValidation.ts` (JPEG/PNG/WebP magic-byte check, 5 MB limit),
  `src/lib/ocr.ts` (canvas resize to 1600 px + self-hosted `tesseract.js`), editable review
  (`src/components/TextReview.tsx`), confidence label, and the "Simulated test" toggle.
- Result page (`src/pages/Result.tsx`): Observed / Reference / Conclusion / limits / next-steps
  blocks, the required disclaimer, source + retrieval time, and the
  `src/lib/confidence.ts:resolveConfirmedConfidence` rule (edited or typed review text counts
  as user-confirmed HIGH; an untouched low-confidence reading stays LOW).
- Scan page: `src/lib/scan.ts` and `@zxing/browser` camera decode with a typed fallback; every
  decoded value is validated before any network call.
- Guide + Help (`src/pages/Guide.tsx`, `/guide` and `/guide#help`): how to read a label, and the
  official channels from `docs/specs.md` §6.5, stating that FoodCheck reports nothing.
- About (`src/pages/About.tsx`): what it does and does not do, sources, limits, privacy notice,
  and "Prototype v1.0 built for a college Community Engagement Project".
- Error boundary (`src/components/ErrorBoundary.tsx`) and offline banner
  (`src/components/OfflineBanner.tsx`), both announced with `role="alert"`.
- Accessibility pass: labelled inputs, visible focus rings, 44 px tap targets, `role="alert"`
  errors, a skip link, and scroll-to-top + heading focus on route change.

### Incomplete (P0 follow-ups, tracked but not built)

- Deployed HTTPS smoke test on a real phone (see Manual tests below).
- Real-device camera capture and OCR on real packs.
- A saved fallback demo, recorded and labelled as such (`AGENTS.md` §8) — not built.
- `/history` is P1 (local to device) and has not been started.

### Deployment

Both paths are prepared and documented below. `wrangler.jsonc` + `src/worker.ts` deploy with
`npx wrangler deploy` (Worker serves `dist/` static assets with SPA fallback and handles
`/api/*`); `functions/` remains valid for `npx wrangler pages deploy`. Both share
`src/lib/edge.ts`. The deployed HTTPS smoke test is still to be done on a real phone.

### OCR assets (self-hosted)

`public/ocr/` holds the `tesseract.js` worker, LSTM core variants and `eng.traineddata.gz`, so
no photo or text leaves the device and no CDN is contacted. `public/_headers` sets a
conservative CSP for the OCR worker/WASM.

### Known limitations

- The shared edge adapter in `src/lib/edge.ts` (routing match, missing User-Agent, invalid
  barcode, upstream 404) is unit tested with a mocked `fetch`, but the real Cloudflare Cache API
  binding (`caches.default`) and the static-asset Worker routing (`run_worker_first`, SPA
  fallback, `_headers`) can only be verified in a real Wrangler/Cloudflare environment, not here.
- The Product page needs the Worker or Pages Function running (e.g. `wrangler dev` or
  `wrangler pages dev`) to load data; plain `vite dev` does not serve `/api`.
- The real Open Food Facts API has not been contacted from a deployed environment here.
- The declaration-phrase and spelling-variant lists are small starting sets from
  `docs/specs.md`; the comparison thresholds are the documented starting values.
- OCR has not been run on real packs or a phone here (browser-only code), and the camera
  barcode scanner (`@zxing/browser`) has not been run on a real device here because it needs a
  camera and an HTTPS (or localhost) origin.
- The Guide's FSSAI source is cited by name; the docs describe a regulation link but do not
  give a URL, so none is shown (no links were invented).
- Secondary flows (camera permission denied, no camera, iPhone Safari, offline banner, a real
  runtime crash, and the deployed HTTPS URL) still need manual device testing.

## Requirements

- Node 20+ (developed on Node 24) and npm.

## Run

```
npm install
npm run dev        # dev server
npm run typecheck  # TypeScript, strict, no emit
npm test           # Vitest unit tests
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
```

## Routes

`/` Home, `/scan` Barcode, `/product/:barcode` Product, `/label/:barcode` Photo/OCR,
`/result/:barcode` Result, `/guide` Guide, `/history` History (P1), `/about` About.

## Dependencies (and why each exists)

- `react`, `react-dom` — UI runtime.
- `react-router-dom` — client-side routing for the routes above.
- `tailwindcss`, `@tailwindcss/vite` — mobile-first styling.
- `vite`, `@vitejs/plugin-react` — dev server and production build.
- `tesseract.js` — in-browser OCR so label photos never leave the device. The worker, core
  and English language data are self-hosted under `public/ocr/` (see OCR assets below).
- `@zxing/browser` — camera barcode decoding on the Scan page. It is the maintained browser
  port of ZXing ("zebra crossing") and reads frames from the device camera in the browser, so
  no barcode image or video leaves the phone. It is used only on the Scan page, alongside a
  typed fallback; every decoded value is still checked by `src/lib/barcode.ts` (length, digits
  only, and check digit) before any network request. It is preferred over hand-rolling barcode
  decoding, per the rule in `AGENTS.md` section 4.
- `@zxing/library` — the ZXing codec that `@zxing/browser` builds on. It is declared explicitly
  in `dependencies` (and pinned in `package-lock.json`) rather than left implicit, and is
  resolved from the same server-assigned address as the browser package, so the Scan page keeps
  a stable, auditable barcode dependency tree.
- `typescript` — strict typing across the app.
- `vitest` — unit tests for pure logic and the banned-words check.
- `wrangler` (dev) — Cloudflare's CLI. Used to deploy the Worker (`wrangler deploy`), to run the
  Worker and static assets locally (`wrangler dev`), and for local/preview testing of the Pages
  Function in `functions/` and the `_headers` file (`wrangler pages dev`), because `vite dev`
  does not run serverless functions. It is a dev dependency and is not shipped to the browser.
- `@types/react`, `@types/react-dom`, `@types/node` — type definitions for the above.

No database, accounts, LLM, cloud OCR or paid API is used.

## OCR assets (self-hosted)

`tesseract.js` normally fetches its worker, WASM core and language data from a CDN. To keep
photos and text on the device and contact no third party, these are vendored into `public/ocr/`:

- `public/ocr/worker.min.js` — copied from `node_modules/tesseract.js/dist/worker.min.js`.
- `public/ocr/core/tesseract-core-*-lstm.wasm(.js)` — copied from `node_modules/tesseract.js-core`
  (non-SIMD, SIMD and relaxed-SIMD LSTM builds, so the library can pick a supported one).
- `public/ocr/lang/eng.traineddata.gz` — the integerized LSTM English model
  (`@tesseract.js-data/eng/4.0.0_best_int`).

To refresh after a dependency upgrade, re-copy the worker and core files from `node_modules`
and re-download `eng.traineddata.gz`. `public/_headers` allows the worker, the WASM core
(`'wasm-unsafe-eval'`) and the language fetch from `self` only.

## Environment variables

The server-side endpoint (Worker or Pages Function) reads its variables from the Cloudflare
environment. For local Wrangler runs, copy `.dev.vars.example` to `.dev.vars`; for the deployed
project, set them as Worker secrets/variables (see Deploy below) or in the Pages dashboard.
`.env.example` lists the same names. Secrets are never bundled into the frontend.

## Deploy

The app is a static SPA (`dist/`) plus one server-side endpoint that proxies Open Food Facts so
the custom User-Agent and cache stay server-side. There are two equivalent ways to deploy it,
and both reuse the same lookup adapter.

### Workers (`npx wrangler deploy`) — the default

`wrangler.jsonc` deploys a Worker (`src/worker.ts`) that also serves the built `dist/` folder as
static assets:

- `assets.directory: "./dist"` uploads the Vite build (including `dist/_headers` and the
  self-hosted OCR files). Cloudflare applies `_headers` to those static assets, so the CSP,
  `nosniff`, `no-referrer` and `Permissions-Policy: camera=(self)` still apply.
- `assets.run_worker_first: ["/api/*"]` sends every `/api/*` request to the Worker before the
  asset server, so API calls are never answered with the SPA's `index.html`.
- `assets.not_found_handling: "single-page-application"` serves `index.html` for unknown
  non-API paths, which is the SPA fallback for the client-side routes.

`src/worker.ts` handles `GET /api/product/:barcode` by calling the shared adapter in
`src/lib/edge.ts`, which calls the unchanged lookup core `lookupProduct` in `src/lib/api.ts`.
That keeps the same barcode validation, edge cache, 5 s timeout, one retry, upstream
normalisation and `{ error: { code, message } }` shape as the Pages Function. Unknown `/api/*`
paths get a JSON 404 and non-GET requests to the product route get a JSON 405, so the client
never receives the SPA HTML for an API call.

**Environment variables (Workers)**

| Name | Required | Purpose |
|---|---|---|
| `OFF_USER_AGENT` | Yes | Custom User-Agent for Open Food Facts. If empty the endpoint returns a JSON 500 instead of calling upstream. |
| `ALLOWED_ORIGIN` | No | CORS origin; set only if the frontend and the endpoint are on different origins. A same-origin deployment can leave it unset. |

Set them with `npx wrangler secret put OFF_USER_AGENT` (or the dashboard: Workers & Pages →
your Worker → Settings → Variables). For local runs, put them in the gitignored `.dev.vars`
file (copy `.dev.vars.example`).

```
npm run build            # produce dist/
npx wrangler dev         # local Worker + static assets; reads .dev.vars
npx wrangler deploy      # deploy after manual testing
```

`wrangler dev` serves the worker at its local URL and applies `dist/_headers`. A phone on the
LAN needs HTTPS for the camera; use the deployed `*.workers.dev` HTTPS URL for real-device
camera testing.

### Cloudflare Pages (`functions/`, kept working)

The app can still be deployed as Pages with the Function in `functions/`. Both deployments share
`src/lib/edge.ts` and the lookup core, so behaviour is identical.

**Pages project build settings**

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None (Vite works too) |
| Root directory | `/` (repository root) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | set `NODE_VERSION` (e.g. `20`) or add `.nvmrc`; developed on Node 24 |

**Environment variables** (Pages → Settings → Environment variables; set for Production and
Preview)

| Name | Required | Purpose |
|---|---|---|
| `OFF_USER_AGENT` | Yes | Custom User-Agent for Open Food Facts. If empty the function returns 500 instead of calling upstream. |
| `ALLOWED_ORIGIN` | No | CORS origin; set only if the frontend and the function are on different origins. A same-origin Pages deployment can leave it unset. |
| `NODE_VERSION` | No | Build-time Node version, e.g. `20`. |

**Why `functions/` and `_headers` are correct for Pages**

- `functions/api/product/[barcode].ts` exports `onRequestGet`, which Pages maps to
  `GET /api/product/:barcode`. It is a thin wrapper over `handleProductLookup` in
  `src/lib/edge.ts` (the same adapter the Worker uses), so it keeps the same barcode validation,
  cache, timeout, retry and error shape. It reads only `context.env` and `context.params`, uses
  the Pages runtime `fetch` and `caches.default`, and never leaks stack traces.
- `public/_headers` is copied by Vite to `dist/_headers`, which Pages applies to `/*`
  (nosniff, no-referrer, camera permission, and a CSP that allows the self-hosted OCR worker
  and WASM plus Open Food Facts product images from `https://*.openfoodfacts.org`).

**Run locally with Wrangler** (`wrangler` is the dependency explained above)

```
npm run build          # produce dist/ (includes _headers and self-hosted OCR assets)
npx wrangler pages dev dist --compatibility-date=2026-10-06
# or: npm run pages:dev  (runs the build, then wrangler pages dev)
```

- `wrangler pages dev` serves `dist/` and auto-detects the `functions/` directory, so
  `/api/product/:barcode` works locally. `vite dev` alone does **not** serve `/api`.
- No Cloudflare login is needed to run `pages dev`; `npx wrangler login` is only for
  `wrangler pages deploy`.
- Put local variables in a gitignored `.dev.vars` file (copy `.dev.vars.example`), e.g.
  `OFF_USER_AGENT=FoodCheck/1.0 (you@example.com)`.
- Open the printed URL (default `http://localhost:8788`). `_headers` is applied by Pages dev.
- A phone on the LAN needs HTTPS for camera and some OCR worker APIs; use the deployed Pages
  URL, or a tunnel, for real-device camera testing.

Deploy after manual testing with `npx wrangler pages deploy dist` (or connect the repo in the
Pages dashboard and let it build on push).

## Manual tests still needed

These cannot be verified in this environment (no camera, no phone, no deployed URL, browser-only
OCR). They must be run on a device and the results recorded by the user before v1.0 is called
done (`AGENTS.md` §5 and §8):

1. **Camera barcode scan** on a phone over HTTPS (`*.workers.dev` or Pages URL): a real EAN-13,
   an EAN-8 and a UPC-A; the "read twice" confirmation; the typed fallback when the camera is
   unavailable; and the permission-denied, insecure-origin and unsupported-browser messages.
2. **Photo + OCR on real packs**: JPEG, PNG and WebP; a file over 5 MB is rejected; the resize
   to 1600 px; a clear pack (expect a higher confidence) and a poor photo (expect the
   low-confidence warning); OCR failure then manual typing; and that the edited text is used for
   the comparison.
3. **End-to-end flow on a phone**: scan → product record (found and not-found) → label →
   review → result, including the three classifications and the required disclaimer on each.
4. **iPhone Safari** specifically: camera access, OCR worker/WASM loading under the CSP, layout
   at 320 px, and 200% text zoom without breaking the layout.
5. **Deployed HTTPS smoke test**: build and deploy, then confirm `/api/product/:barcode` returns
   the JSON error shape (not the SPA HTML) for a bad barcode and unknown `/api/*` paths, that the
   custom `OFF_USER_AGENT` is sent, and that `_headers` (CSP, nosniff, no-referrer, camera
   permission) is applied.
6. **Offline banner**: toggle airplane mode and confirm the banner appears and disappears.
7. **Error boundary**: force a runtime error in a route and confirm the fallback with `Retry` and
   "Go to home" works.
8. **Guide/Help links**: confirm the Food Safety Connect link opens (opening each link before the
   demo is required by `docs/specs.md` §6.5).

## Wording rule

The app must not contain the banned claims listed in `docs/UI_UX.md` section 9.1 except
inside the three required disclaimer sentences. `src/lib/__tests__/bannedWords.test.ts`
enforces this against `src/data/uiStrings.ts` using whole-word matching, so a banned term
embedded in another word is still caught.

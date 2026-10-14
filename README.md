# FoodCheck

Mobile-first web app that compares a packaged food's printed ingredient list (read from a
photo with in-browser OCR) with its Open Food Facts record, and reports one of three
classifications: **Consistent with available records**, **Potential discrepancy**, or
**Insufficient evidence**. It is not a lab test and never judges safety or authenticity.

Prototype v1.0 for a college Community Engagement Project.

## Status

**Steps 1-8 complete.** Shell/routing, barcode validation, product lookup, the Product page
wired to the lookup, deterministic ingredient normalisation + comparison, label photo
capture/upload with in-browser OCR and an editable review step, the Result page, and the
Scan page with camera barcode reading plus a typed fallback.

- Result page (`src/pages/Result.tsx`) shows separate Observed, Reference, Conclusion, Limits
  and Next steps blocks, the required disclaimer line, the source and retrieval time, an
  optional "Simulated test" badge for simulated text, and links back to the label, the Guide
  and Scan. `src/lib/confidence.ts:resolveConfirmedConfidence` makes any user-typed or edited
  review text count as user-confirmed (HIGH); an untouched low-confidence reading stays LOW.

- Implemented: shell/routing; `src/lib/barcode.ts` (EAN-13/EAN-8/UPC-A validation, UPC-A
  padded to 13 digits for upstream lookups); `src/lib/api.ts` lookup core (validate → cache →
  Open Food Facts fetch with 5 s timeout, one retry on timeout/5xx, normalise, cache,
  stale-on-failure) with the Cloudflare Pages Function adapter in
  `functions/api/product/[barcode].ts`; `src/lib/productClient.ts` + Product page
  (loading / found / not-found / no-ingredients / upstream-error states); `src/lib/normalize.ts`,
  `src/lib/compare.ts`, `src/lib/constants.ts` (comparison thresholds, declaration phrases,
  spelling variants); `src/lib/imageValidation.ts` (JPEG/PNG/WebP magic-byte check, 5 MB limit),
  `src/lib/ocr.ts` (canvas resize to 1600 px long side + `tesseract.js` worker) and the Label
  page + `ImagePicker`, `OcrProgress`, `ConfidenceLabel`, `TextReview` components; the Scan page
  with `src/lib/scan.ts` (two-identical-read confirmation, camera availability check) and the
  `BarcodeScanner` (`@zxing/browser`, EAN-13/EAN-8/UPC-A only) + `BarcodeInput` components.
  The scanner stops its video tracks when the screen unmounts, and every read is validated by
  `src/lib/barcode.ts` before navigating to `/product/:barcode`.
- Not implemented: Guide/About content.
- Deployment: Cloudflare Pages configuration is prepared and documented below (build settings,
  environment variables, local `wrangler pages dev`); the deployed HTTPS smoke test is still
  to be done on a real phone.
- Simulated: nothing. Tests use a mocked upstream and clearly labelled placeholder data
  ("Sample Product, simulated test"); no real network is called in tests. Deliberately
  altered label text must be shown with the "Simulated test" label (`src/data/simulated.ts`).
- OCR assets are self-hosted under `public/ocr/` (worker, LSTM core variants, `eng.traineddata`)
  so no photo or text leaves the device and no CDN is contacted. `public/_headers` sets a
  conservative CSP for the OCR worker/WASM.
- Known limitations: the Cloudflare Pages Function adapter (edge cache, CORS, Response
  mapping) is not unit tested here; it needs an environment with the Cloudflare Cache API.
  The Product page needs the Pages Function running (e.g. `wrangler pages dev`) to load data;
  plain `vite dev` does not serve `/api`. The real Open Food Facts API has not been contacted
  yet (see below). The declaration-phrase and spelling-variant lists are small starting sets
  from `docs/specs.md`; the comparison thresholds are the documented starting values. OCR has
  not been run on real packs or a phone here (browser-only code); the camera barcode scanner
  (`@zxing/browser`) has not been run in a browser or on a real pack here either, because it
  needs a camera and an HTTPS (or localhost) origin. Camera permission denied, no camera,
  iPhone Safari and the deployed HTTPS URL still need manual device testing.

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
  decoding, per the rule in `AGENTS.md` section 4. Its `@zxing/library` codec dependency is
  bundled with it and is not a separate entry in `package.json`.
- `typescript` — strict typing across the app.
- `vitest` — unit tests for pure logic and the banned-words check.
- `wrangler` (dev) — Cloudflare's CLI. Used only for local/preview testing of the Pages
  Function in `functions/` and the `_headers` file, because `vite dev` does not run
  serverless functions. It is a dev dependency and is not shipped to the browser.
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

The server function reads its variables from the Pages environment. For local Wrangler runs,
copy `.dev.vars.example` to `.dev.vars`; for the deployed project, set them in the Pages
dashboard. `.env.example` lists the same names. Secrets are never bundled into the frontend.

## Deploy to Cloudflare Pages

The app is a static SPA (`dist/`) plus one Pages Function that proxies Open Food Facts so the
custom User-Agent and cache stay server-side.

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
  `GET /api/product/:barcode`. It reads only `context.env` and `context.params`, uses the
  Pages runtime `fetch` and `caches.default`, and never leaks stack traces.
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

## Wording rule

The app must not contain the banned claims listed in `docs/UI_UX.md` section 9.1 except
inside the three required disclaimer sentences. `src/lib/__tests__/bannedWords.test.ts`
enforces this against `src/data/uiStrings.ts` using whole-word matching, so a banned term
embedded in another word is still caught.

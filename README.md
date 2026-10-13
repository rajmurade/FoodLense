# FoodCheck

Mobile-first web app that compares a packaged food's printed ingredient list (read from a
photo with in-browser OCR) with its Open Food Facts record, and reports one of three
classifications: **Consistent with available records**, **Potential discrepancy**, or
**Insufficient evidence**. It is not a lab test and never judges safety or authenticity.

Prototype v1.0 for a college Community Engagement Project.

## Status

**Steps 1-6 complete.** Shell/routing, barcode validation, product lookup, the Product page
wired to the lookup, deterministic ingredient normalisation + comparison, and label photo
capture/upload with in-browser OCR and an editable review step.

- Implemented: shell/routing; `src/lib/barcode.ts` (EAN-13/EAN-8/UPC-A validation, UPC-A
  padded to 13 digits for upstream lookups); `src/lib/api.ts` lookup core (validate → cache →
  Open Food Facts fetch with 5 s timeout, one retry on timeout/5xx, normalise, cache,
  stale-on-failure) with the Cloudflare Pages Function adapter in
  `functions/api/product/[barcode].ts`; `src/lib/productClient.ts` + Product page
  (loading / found / not-found / no-ingredients / upstream-error states); `src/lib/normalize.ts`,
  `src/lib/compare.ts`, `src/lib/constants.ts` (comparison thresholds, declaration phrases,
  spelling variants); `src/lib/imageValidation.ts` (JPEG/PNG/WebP magic-byte check, 5 MB limit),
  `src/lib/ocr.ts` (canvas resize to 1600 px long side + `tesseract.js` worker) and the Label
  page + `ImagePicker`, `OcrProgress`, `ConfidenceLabel`, `TextReview` components.
- Not implemented: result page, camera barcode scan, Guide/About content, deploy config.
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
  not been run on real packs or a phone here (browser-only code); camera capture, iPhone Safari
  and the deployed HTTPS URL still need manual device testing.

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
- `typescript` — strict typing across the app.
- `vitest` — unit tests for pure logic and the banned-words check.
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

Copy names from `.env.example` into `.env` when the server function from a later step
needs them. Secrets are never bundled into the frontend.

## Wording rule

The app must not contain the banned claims listed in `docs/UI_UX.md` section 9.1 except
inside the three required disclaimer sentences. `src/lib/__tests__/bannedWords.test.ts`
enforces this against `src/data/uiStrings.ts` using whole-word matching, so a banned term
embedded in another word is still caught.

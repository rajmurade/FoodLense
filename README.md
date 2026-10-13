# FoodCheck

Mobile-first web app that compares a packaged food's printed ingredient list (read from a
photo with in-browser OCR) with its Open Food Facts record, and reports one of three
classifications: **Consistent with available records**, **Potential discrepancy**, or
**Insufficient evidence**. It is not a lab test and never judges safety or authenticity.

Prototype v1.0 for a college Community Engagement Project.

## Status

**Steps 1-5 complete.** Shell/routing, barcode validation, product lookup, the Product page
wired to the lookup, and deterministic ingredient normalisation + comparison.

- Implemented: shell/routing; `src/lib/barcode.ts` (EAN-13/EAN-8/UPC-A validation, UPC-A
  padded to 13 digits for upstream lookups); `src/lib/api.ts` lookup core (validate → cache →
  Open Food Facts fetch with 5 s timeout, one retry on timeout/5xx, normalise, cache,
  stale-on-failure) with the Cloudflare Pages Function adapter in
  `functions/api/product/[barcode].ts`; `src/lib/productClient.ts` + Product page
  (loading / found / not-found / no-ingredients / upstream-error states); `src/lib/normalize.ts`,
  `src/lib/compare.ts`, `src/lib/constants.ts` (comparison thresholds, declaration phrases,
  spelling variants).
- Not implemented: photo/OCR capture and review, result page, camera scan, Guide/About
  content, deploy config.
- Simulated: nothing. Tests use a mocked upstream and clearly labelled placeholder data
  ("Sample Product, simulated test"); no real network is called in tests. Deliberately
  altered label text must be shown with the "Simulated test" label (`src/data/simulated.ts`).
- Known limitations: the Cloudflare Pages Function adapter (edge cache, CORS, Response
  mapping) is not unit tested here; it needs an environment with the Cloudflare Cache API.
  The Product page needs the Pages Function running (e.g. `wrangler pages dev`) to load data;
  plain `vite dev` does not serve `/api`. The real Open Food Facts API has not been contacted
  yet (see below). The declaration-phrase and spelling-variant lists are small starting sets
  from `docs/specs.md`; the comparison thresholds are the documented starting values.

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
- `typescript` — strict typing across the app.
- `vitest` — unit tests for pure logic and the banned-words check.
- `@types/react`, `@types/react-dom`, `@types/node` — type definitions for the above.

No database, accounts, LLM, cloud OCR or paid API is used.

## Environment variables

Copy names from `.env.example` into `.env` when the server function from a later step
needs them. Secrets are never bundled into the frontend.

## Wording rule

The app must not contain the banned claims listed in `docs/UI_UX.md` section 9.1 except
inside the two required disclaimer sentences. `src/lib/__tests__/bannedWords.test.ts`
enforces this against `src/data/uiStrings.ts` using whole-word matching, so a banned term
embedded in another word is still caught.

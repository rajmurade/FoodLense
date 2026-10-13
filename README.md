# FoodCheck

Mobile-first web app that compares a packaged food's printed ingredient list (read from a
photo with in-browser OCR) with its Open Food Facts record, and reports one of three
classifications: **Consistent with available records**, **Potential discrepancy**, or
**Insufficient evidence**. It is not a lab test and never judges safety or authenticity.

Prototype v1.0 for a college Community Engagement Project.

## Status

**Step 1 complete: project shell only.** Routes, layout, header, bottom tab bar and the
persistent footer disclaimer exist; every page is an empty placeholder. No lookup, OCR,
comparison or result logic is implemented yet.

- Not implemented: barcode utilities, product lookup, ingredient comparison, photo/OCR,
  result page, camera scan, Guide/About content, deploy config.
- Simulated: nothing yet. Placeholder strings only.
- Known limitations: all screens are placeholders; no data is fetched.

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

# AGENTS.md: FoodCheck (CEP prototype v1.0)

You are the coding agent for FoodCheck. Read these files first, every session:
`docs/specs.md` (what and why), `docs/TECH_STACK.md` (how), `docs/UI_UX.md` (screens and wording), `docs/FOODLENS_PLAN.md` (sources and layout notes).
Order of authority if they conflict: this file, then `specs.md`, `UI_UX.md`, `TECH_STACK.md`, `FOODLENS_PLAN.md`.

## 1. Project in one paragraph
A mobile-first web app that compares a packaged food's printed ingredient list (read from a photo with in-browser OCR) with its Open Food Facts record and reports Consistent, Potential discrepancy, or Insufficient evidence, with sources and limits. It is NOT a lab test and never judges safety or authenticity.

## 2. Scope discipline
- Build **P0 only** (see `specs.md` section 5). Do not start P1 until P0 is finished, tested and committed. Never build P2.
- Work in small steps, in this order, and stop after each for review:
  1. Project shell, routes, layout, header, tab bar, footer disclaimer (empty pages)
  2. Barcode utilities with unit tests
  3. Product lookup function (`functions/api/product/[barcode].ts`) with mocked-upstream tests
  4. Product page wired to the lookup
  5. Ingredient normalise + compare functions with unit tests
  6. Photo capture/upload + OCR + editable text
  7. Result page
  8. Camera barcode scan with typed fallback
  9. Guide, About, error states, polish, accessibility pass
  10. Deploy configuration and smoke test
- If a request seems to need something outside scope, say so and ask instead of building it.

## 3. Hard rules about wording and claims
- Never output (UI, code, comments, tests, sample data, commit messages): SAFE, UNSAFE, VERIFIED, GENUINE, FAKE, ADULTERATED, "FSSAI Approved", "No Risk Detected", or any health/safety score.
- Only these result labels are allowed: **Consistent with available records**, **Potential discrepancy**, **Insufficient evidence**. Every result screen shows: "This does not confirm the product is genuine or safe."
- A barcode or database record is not proof of authenticity. Say so on the Product page.
- FSSAI licence number (P1): check only that it has 14 digits and link to FoSCoS. Never claim it was verified.
- Never claim anything was reported to FSSAI; only show official channels.
- Do not invent API endpoints, fields, product data, regulations, links or sources. Missing data is displayed as "Not available".
- Do not use real brand names or pack images in sample or test data. Use clearly labelled placeholders ("Sample Product, simulated test").
- Any deliberately altered label text must be labelled "Simulated test" in the UI.
- Add a unit test that fails if a banned word appears in the UI strings file.

## 4. Technical rules
- TypeScript (strict), React, Vite, Tailwind, React Router. Stack details: `TECH_STACK.md`.
- Business logic lives in `src/lib/` as pure functions with no React imports.
- Comparison is deterministic. **No LLM calls, no cloud OCR, no paid APIs, no database, no accounts.**
- Validate barcodes (length, digits, checksum) before any network call.
- Server function: one endpoint `GET /api/product/:barcode`; 5 s timeout, one retry, cache, one error shape (`{ error: { code, message } }`); never leak stack traces.
- Always send the custom User-Agent from `OFF_USER_AGENT` to Open Food Facts.
- Photos never leave the browser. Do not log images or OCR text.
- Render all external text (OCR, database) as plain text; never `dangerouslySetInnerHTML`.
- Never show a successful result when a dependency failed.
- Secrets only in environment variables. Keep `.env*` ignored; commit `.env.example` with names only.
- Keep dependencies minimal; explain each new dependency in the README before adding it. Use maintained libraries instead of hand-rolling OCR or barcode decoding.
- Accessibility: labelled inputs, keyboard navigation, visible focus, 44 px tap targets, status as icon + text, `role="alert"` for errors.

## 5. Testing requirements
Before saying a step is done, run the tests and the production build and report the actual results.
- Unit tests required (Vitest): barcode validation (valid EAN-13/EAN-8/UPC-A, bad checksum, letters, wrong length); ingredient normalisation; comparison (identical, reordered, spelling variant, extra item, missing item, heavy mismatch, empty reference, empty observed, low OCR confidence, brackets, percentages); product normaliser (full, partial, malformed); lookup function with mocked upstream (found, not found, timeout then success, timeout with cache, timeout without cache); banned-words check.
- Comparison thresholds (0.85 similarity, 90% matched, 10% unmatched) are starting values defined in one constants file. Do not change them silently; report any change and why.
- Do not weaken or delete a test to make it pass. If a test is wrong, explain why before changing it.
- Manual checks are recorded by the user; list what still needs manual device testing (camera, OCR on real packs, iPhone Safari, deployed HTTPS URL).

## 6. Do not change without asking
- The three result labels and the banned-words list.
- The comparison thresholds and the declaration-phrase list (except via the constants file with a report).
- The scope lists in `specs.md`.
- The files in `docs/`, and this file.
- Anything marked "NOT VERIFIED" in `FOODLENS_PLAN.md`: do not turn it into a claim in the app.
- Working functionality from earlier steps: no rewrites or refactors unless needed for the current step.

## 7. Working style
- Before coding a step: restate the step in two lines, list files you will create or change.
- Make small commits with clear messages (one step per commit).
- After each step report: what changed, test and build results, what is incomplete, what is simulated, anything uncertain.
- If documentation or an API behaves differently from the spec, stop and report. Do not guess.
- If something cannot be tested here (camera, real packs), say so plainly. Do not claim it works.

## 8. Definition of done (v1.0)
- P0 features work end to end on a phone over HTTPS.
- Unit tests pass; production build succeeds; no banned wording.
- Failure paths (not found, no ingredients, upstream down, bad image, OCR failure, offline) show honest messages.
- README lists: what is implemented, what is incomplete, what is simulated, known limitations, and how to run it.
- A saved fallback demo exists and is labelled as recorded.

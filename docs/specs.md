# specs.md: FoodCheck (CEP 2026, prototype v1.0)

Product name: **FoodCheck** (earlier drafts used "FoodLens"; same project).
Context: Community Engagement Project, S.E. AIML, Samarth College of Engineering and Management, Belhe. Deadline 15 Oct 2026.
Companion files: `TECH_STACK.md`, `UI_UX.md`, `AGENTS.md`, `FOODLENS_PLAN.md` (sources and layout notes).

---

## 1. Overview

FoodCheck is a mobile-first web app that helps a consumer examine a packaged food label. The user identifies a product by barcode, photographs the ingredient list, and the app compares what is printed on the pack with the product's record in Open Food Facts. It then reports what is consistent, what differs, and what cannot be verified, and points to official channels if the user is concerned.

**FoodCheck is not a laboratory test.** It does not detect adulteration inside food, does not prove a product is genuine, and does not say a product is safe or unsafe.

## 2. Problem

Consumers can read labels and packaging but have no easy way to check whether what is printed is consistent with other information about the product. Ingredient lists are hard to interpret, records can be incomplete, and counterfeit or misleading packaging exists. A barcode alone proves nothing because barcodes can be copied.

(Community evidence for this problem must come from a **real** survey of 15-20 people, see section 14. Do not present simulated agent responses as survey data.)

## 3. Goals and non-goals

### Goals
- Look up a product by barcode and show its database record with source and time retrieved.
- Read the ingredient panel from a photo (OCR) and let the user correct the text.
- Compare label text with the database ingredient list and classify the result with evidence.
- Explain limits clearly and show official complaint channels.

### Non-goals (never in v1.0)
- Chemical testing or adulteration detection from a photo.
- Proving authenticity from a barcode or record.
- Any verdict of SAFE, UNSAFE, VERIFIED, GENUINE, FAKE or ADULTERATED, or a health or safety score.
- Automatic FSSAI licence verification (no public API found; the official lookup uses a captcha).
- Submitting complaints to FSSAI on the user's behalf.
- Accounts, login, personalised greeting, community features, a desktop admin dashboard.

## 4. Users

Consumers buying packaged food and drinks in India; students and families learning to read labels; community groups running awareness sessions. No account needed.

## 5. Scope

### P0: required for the demo
1. Responsive Home with Scan and Type-barcode actions.
2. Barcode entry by typing; camera scan with typed fallback.
3. Product lookup via Open Food Facts, showing source and retrieval time.
4. Product page showing fields that exist and "Not available" for those that don't.
5. Ingredient photo capture or upload with preview.
6. In-browser OCR with confidence indicator.
7. Editable OCR text.
8. Deterministic ingredient comparison (section 7).
9. Result page with three classifications, evidence, limits, next steps.
10. Error handling for not found, no ingredients, upstream failure, bad image, OCR failure.
11. Help page with official channels. About page with sources and limits.

### P1: only if P0 is finished and tested
- Scan history (local to the device).
- FSSAI licence number field (14-digit format check + link to FoSCoS).
- Label checklist (FSSAI logo, licence number, batch, MFG/expiry, MRP).
- Nutrition comparison with unit normalisation.
- Simple ingredient explanations from a curated, cited list.
- Expiry date typed by the user from the pack.

### P2: future scope (write in the report, do not build)
Accounts and history sync; user-submitted corrections with moderation; GS1 India / official data partnerships; claim analysis against FSSAI rules; Hindi and Marathi OCR and UI; official reporting integration; load testing and monitoring.

## 6. Functional requirements

### 6.1 Barcode
- Accept EAN-13, EAN-8, UPC-A (12 digits, treated as EAN-13 with leading 0).
- Validate length, digits only, and check digit **before** any network call.
- Barcode prefix 890 may be shown as "barcode registered via GS1 India", labelled as a hint only.

### 6.2 Product record
Fields requested: code, product_name, brands, quantity, ingredients_text, countries_tags, labels_tags, image_front_url, last_modified_t (plus nutriments in P1).
Always show: "Source: Open Food Facts (community data)" and "Retrieved: <date time>".
Always show: "A database record does not prove this pack is genuine."

### 6.3 Label photo
- Accept JPEG, PNG, WebP. Maximum 5 MB before resize; resize to max 1600 px on the long side before OCR.
- Check real file content, not only the extension; reject others with a clear message.
- Photo stays in the browser. It is never uploaded to a server or third party.

### 6.4 OCR and review
- Run `tesseract.js` in the browser with a visible progress indicator.
- Show a confidence label (Low / Medium / High). If low, warn and suggest retaking the photo.
- Pre-fill an editable text area. The comparison uses the **user-confirmed** text.
- If OCR fails, the user can type the ingredients manually.

### 6.5 Official guidance
Help page lists: re-check the pack; check the manufacturer's official information; FSSAI helpline 1800-112-100 (24x7); Food Safety Connect (`https://foscos.fssai.gov.in/consumergrievance`); National Consumer Helpline 1915; FoSCoS FBO Search for licence numbers. State clearly that FoodCheck reports nothing on the user's behalf. Confirm each link opens before the demo.

## 7. Ingredient comparison behaviour

Pure function: `compareIngredients(observedText, referenceText, ocrConfidence) -> Finding`. No network, no LLM.

### 7.1 Normalise both texts
1. Lowercase; collapse whitespace; unify punctuation and brackets.
2. Remove the leading word "ingredients" and a trailing full stop.
3. Split into items on commas and semicolons **outside** brackets.
4. Flatten bracketed sub-ingredients into separate items; keep INS/E numbers as items.
5. Strip percentages and quantities (e.g. "sugar (12%)" becomes "sugar").
6. Drop declaration phrases that are not ingredients (e.g. "contains permitted natural colour"). Keep this list small and in one constant.
7. Trim and de-duplicate.

### 7.2 Match
For each reference item, find the best observed item by normalised edit-distance similarity. Count as matched if similarity is at or above **0.85**. Optionally apply a small, cited synonym table (e.g. common spelling variants). Order is ignored.

### 7.3 Classify

| Condition | Result |
|---|---|
| Either list missing or empty | Insufficient evidence |
| OCR confidence Low, or fewer than 3 items on either side | Insufficient evidence |
| At least 90% of reference items matched and at most 10% of observed items unmatched | Consistent with available records |
| Otherwise | Potential discrepancy |

The numbers 0.85, 90% and 10% are **starting values**. Tune them on 3-4 real packs and record the final values and the tests used in the report.

### 7.4 Output (Finding)
```
id, type="ingredient_list",
observed_items[], reference_items[],
matched[], only_on_label[], only_in_record[],
order_differs (info only),
classification, uncertainty note,
sources: { observed: "user-confirmed label text", reference: "Open Food Facts", retrieved_at },
method: "normalised, fuzzy match >= 0.85, order ignored",
explanation (plain language)
```
For Potential discrepancy, the explanation must list possible benign causes: recipe change, regional variant, outdated record, OCR error.

## 8. Result model

Every result shows, in separate blocks: **Observed** (label), **Reference** (database), **Conclusion** (classification + explanation), **Limits**, **Next steps**.

Allowed labels (icon + text):
- Consistent with available records
- Potential discrepancy
- Insufficient evidence

Always show: "This does not confirm the product is genuine or safe."

## 9. Error and edge behaviour

| Situation | Behaviour |
|---|---|
| Invalid barcode (length, digits, checksum) | Inline message; no network call |
| Product not found | "Not in the database. Common for local products." User can still type or photograph the label; result will be Insufficient evidence |
| Record found, no ingredients | Show record; comparison returns Insufficient evidence |
| Upstream timeout or 5xx | One retry, then cached copy if any (marked stale), else clear error with retry |
| Malformed upstream data | Treat as upstream failure; never invent fields |
| Camera denied / no camera / no HTTPS | Typed barcode input and file upload |
| Bad image (type, size, corrupt) | Clear rejection message |
| OCR fails or low confidence | Warn; allow manual text |
| Offline | Banner; offer retry; do not show fake results |
| Unexpected error | Error boundary with reload; no stack traces |

Never display a successful analysis when a dependency failed.

## 10. Non-functional requirements

- **Privacy:** no accounts; photos stay on device; no personal data collected; history in local storage only (P1); a short privacy notice on About.
- **Performance:** loading states for lookup and OCR; do not block the UI during OCR. No latency numbers are promised until measured on the demo device.
- **Scale:** designed for modest demand (about 500 occasional users). Do not claim 500 concurrent users without a load test.
- **Accessibility:** labelled inputs, keyboard navigation, visible focus, 44 px tap targets, status never by colour alone.
- **Security:** see `TECH_STACK.md` section 8 and `AGENTS.md`.

## 11. Data sources and honesty about them

- **Product reference data:** Open Food Facts (community-maintained, ODbL licence, coverage of Indian products is partial). It is **not** government data.
- **Government/official sources (rules and guidance only):** FSSAI Labelling and Display Regulations 2020 and amendments; FoSCoS; Food Safety Connect; FSSAI helpline; National Consumer Helpline. Links and verification status: `FOODLENS_PLAN.md` Part 2.
- No public government barcode-to-ingredients database was found. Say so in the report.

## 12. Testing plan

Automated (must pass):
- Barcode: valid EAN-13, EAN-8, UPC-A; bad checksum; letters; wrong length.
- Comparison: identical lists; reordered lists; spelling variant; one extra item; one missing item; heavy mismatch; empty reference; empty observed; low OCR confidence; bracketed sub-ingredients; percentages.
- Product normaliser: full record, missing fields, malformed JSON.
- Product endpoint with mocked upstream: found, not found, timeout then success, timeout with cache, timeout without cache.

Manual (record the results in a table for the report):
- Look up 10 real packs from home: how many found, how many with ingredient lists.
- OCR on 5 real ingredient panels: note confidence and corrections needed.
- Camera scan on one Android and one iPhone.
- Blurry photo, wrong file type, offline, unknown barcode.
- Deployed URL opens over HTTPS on a phone.

Test data rule: any deliberately altered label text must be labelled "Simulated test" in the UI and in the report, never presented as manufacturer misconduct.

## 13. Demo plan (about 3 minutes)

1. One-line problem, with the real survey number.
2. Enter or scan the barcode of one real pack that you have already tested.
3. Show the product record and its source.
4. Photograph the ingredient panel; show OCR text and correct one word.
5. Show the result with evidence.
6. Show a **simulated** edit producing "Potential discrepancy", labelled as simulated.
7. Show an unknown barcode producing "Insufficient evidence".
8. State what the app can and cannot establish.
Fallback: saved screenshots and a screen recording, clearly labelled as recorded.

## 14. CEP report requirements (not code, but part of the project)

- **Real survey:** short Google Form, 15-20 people (family, neighbours, local shopkeepers). Results feed Chapter 2.
- **Simulated agent output** may be mentioned only as background research, never as field data.
- Chapter 1 reuses the existing food-adulteration material with cited sources.
- Chapters 3 and 4 use this spec, the architecture, test tables and screenshots.
- Chapter 5.3 uses the P2 list.
- Daily diary entries should reflect what was actually done each day.

## 15. Success criteria

- A product can be looked up by barcode and shown with source and time.
- A label photo is read by OCR and can be corrected.
- The comparison returns one of the three classifications with evidence.
- Failures never produce fabricated conclusions.
- No banned wording appears anywhere in the app.
- Unit tests for barcode and comparison pass; the production build succeeds; the deployed URL works on a phone.
- Limitations and untested items are listed honestly.

## 16. Open items

- Confirm the Open Food Facts v2 product read still works and note its current rate limits.
- Confirm all official links open (FoSCoS, Food Safety Connect, consumerhelpline.gov.in, FSSAI regulations page).
- Not yet verified: FSSAI DART book link, Food Additives Regulations 2011 link, GS1 India details.
- Confirm with the guide whether a working prototype is required, whether a PPT is required, and whether key code belongs in an appendix.

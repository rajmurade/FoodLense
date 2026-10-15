# UI_UX.md: FoodCheck v1.0

Source of look and feel: the supplied FoodCheck concept image (green shield logo, white cards on pale green, rounded corners, large primary button). **Layout and structure follow this file. Wording follows this file, not the concept image**, because the image contains claims the app cannot support (see section 9).

## 1. Principles

1. Honest first: say what is known, what differs, what cannot be verified.
2. One clear next action on every screen.
3. Mobile-first (design at 360 px), scale up.
4. Never rely on colour alone: every status has an icon and a text label.
5. Observations, database data and conclusions are always visually separate.

## 2. Visual style

| Item | Value |
|---|---|
| Primary green | about `#1E7F3C` (approximate, taken from the concept image) |
| Dark text | about `#14301F` |
| Page background | pale green about `#EEF6EF` |
| Cards | white, 16 px radius, soft shadow, 16 px padding |
| Warning | amber with a warning icon and text |
| Neutral / insufficient | grey-blue with a question icon and text |
| Font | system font stack or Inter; body 16 px minimum |
| Icons | one outline icon set, consistent stroke |
| Logo | green shield with leaf + "FoodCheck" wordmark; tagline "Check your food label. Stay informed." |
| Do not use | the real brand packs from the concept image; real company logos; FSSAI/BIS logos |

Contrast: text and buttons must meet WCAG AA. Check the green on white and white on green.

## 3. Navigation

- **Every screen width:** sticky top header (logo + About link only) + a fixed **bottom** tab bar with four tabs: **Home, Scan, Guide, Help**. The header no longer carries the primary text nav.
- The bottom bar is shown at all widths. The layout adds bottom padding and respects safe-area insets so the footer and content are never covered by the bar.
- Each tab is an outline icon plus a short text label, and is a 44 px tap target with an `aria-label`. The active tab is marked by icon + label + a shape (a filled pill and a top indicator bar), **not by colour alone**; it also sets `aria-current="page"`.
- Product, Label and Result screens keep the **Scan** tab active.
- `/history` stays as a route but is removed from the navigation (P1, local to device).
- A dedicated `/help` screen shows the official channels. The `/guide#help` anchor keeps working and links to the same channels.
- Desktop/tablet: same screens and same bottom bar, centred column up to about 720 px.
- Step progress bar ("1 Barcode, 2 Product, 3 Label, 4 Review, 5 Result") shown only on the flow screens, with text and numbers.
- Back button on every flow screen. The flow state (barcode, text) is preserved when going back.
- No Profile tab, no login. About replaces it (reachable from header and footer).

## 4. Routes and screens

| Route | Screen | Tab highlighted |
|---|---|---|
| `/` | Home | Home |
| `/scan` | Barcode (camera or typed) | Scan |
| `/product/:barcode` | Product record | Scan |
| `/label/:barcode` | Photo, OCR, review text | Scan |
| `/result/:barcode` | Comparison result | Scan |
| `/guide` | How to read a label (help anchor `#help` kept) | Guide |
| `/help` | Official help channels | Help |
| `/history` | Recent scans (P1; local to device) | none (not in the nav) |
| `/about` | Sources, limits, privacy | none |

### 4.1 Persistent footer (every page)
"FoodCheck compares labels with database records. It is not a lab test and cannot confirm a food is safe or genuine."  Link: Help.

### 4.2 Home
```
[hero: green gradient, shield logo, "FoodCheck", tagline, decorative inline SVG]

[ Scan a barcode            > ]   primary, large
[ Type a barcode            > ]

[ Need help? ]                    amber/warm card, icon, large text
  FSSAI helpline 1800-112-100 (24x7)   tel:1800112100
  National Consumer Helpline 1915      tel:1915
  Food Safety Connect                  https://foscos.fssai.gov.in/consumergrievance
  "FoodCheck does not report anything for you."

Learn to read a label             white cards: icon, title, source name, "Opens in a new tab"
Watch and learn                   video cards: "Search on YouTube"
                                  "External resources. Not run by FoodCheck."

How it works:  1 Scan or enter   2 Photograph ingredients   3 See what matches

Note: Guidance based on available data. Not a lab test. For confirmed
results contact official food testing laboratories.
```
Kept from before: the logo, tagline, primary "Scan a barcode" button, "Type a barcode" and the required note. Added: a hero with a green gradient and an inline SVG illustration, the help card, a "Learn to read a label" section, a "Watch and learn" section and the three-step "How it works" strip.

Card rules: white, 16 px radius, soft shadow, one outline icon, a title, the source name, and "Opens in a new tab" (opened with `target="_blank"` and `rel="noopener noreferrer"`). Video cards link to YouTube search results and are labelled "Search on YouTube". All resources are external links only: no third-party images, iframes or embeds (the CSP blocks them and linking out protects privacy). System fonts only.

No personal greeting. The concept's "Report Concern" quick action becomes the help card (FoodCheck does not submit reports itself).

### 4.3 Scan
```
< Back                        Step 1 of 5
+------------------------------+
|  camera preview              |
|    [ framing box ]           |
+------------------------------+
Hold the barcode 15-20 cm away. Keep it steady.
[ Type it instead ]
Barcode  [ 8901234567890 ]  [ Look up ]
```
States:
- Camera permission denied, no camera, or not HTTPS: hide preview, show typed input and an explanation.
- Invalid barcode: inline message, no request sent.
- Nothing read after 15 s: tips (light, distance, steady) + typed input.
- Accept a scan only after two identical reads; vibrate on success if supported.
- Stop camera tracks when leaving the screen.

### 4.4 Product
```
< Back                        Step 2 of 5
[image]  Product name
         Brand - Quantity
Barcode 8901234567890
Source: Open Food Facts (community data)
Retrieved: 14 Oct 2026, 21:40

Ingredients (from database)
 <text> or "Not available in this record"

! A database record does not prove this pack is genuine.
[ Next: photograph the ingredient list ]
```
States: loading skeleton; **not found** ("Not in the database. This is common for local products. You can still photograph the label."); **no ingredients** (explain the result will be Insufficient evidence); upstream error (Retry / Continue without record).

### 4.5 Label (photo, OCR, review)
```
< Back                        Step 3-4 of 5
Photograph the ingredient list
[ Take photo ]  [ Upload image ]
[preview]  [ Retake ]
[ Read text ]   <progress bar while OCR runs>

Review the text we read
+------------------------------+
| editable text area           |
+------------------------------+
Reading confidence: Medium   (text label)
! Fix any wrong words before comparing.
[ Compare ]
```
States: wrong file type or too big (clear message); low confidence (warn, suggest retake, still allow editing); OCR failed (show empty text area to type manually). Keep typed text if a request fails.

### 4.6 Result
```
< Back                        Step 5 of 5
[image] Product name        Barcode

 [icon] Consistent with available records
        (or Potential discrepancy / Insufficient evidence)
 This does not confirm the product is genuine or safe.

 Product record      Found in Open Food Facts   (or Not found)
 Ingredient list     <classification label>
 FSSAI licence no.   (P1) Format OK - Check on FoSCoS [link]

 Details: Ingredient list
   Observed (your label)   | Reference (database)
   matched ........        |
   Only on label: ...      | Only in record: ...
   Method: normalised, fuzzy-matched, order ignored
   Source: Open Food Facts, retrieved <time>
   Why this may happen: recipe change, regional variant,
   outdated record, reading errors

 What this cannot tell you
   It does not prove authenticity, safety, or absence of adulteration.

 Next steps
 [ Re-check the text ]   [ Official help ]
 [ Scan another product ]  [ Share ]  (Share is optional)
```
Result rows use the concept image's row layout (icon, label, value) with the wording from section 9.

### 4.7 Guide
Two sections.
1. **How to read a label:** static, cited content on what FSSAI labelling rules require on pre-packaged food (name, ingredient list, nutrition information, FSSAI logo with licence number, dates). Source: FSSAI Labelling and Display Regulations 2020 and amendments (link). Write in your own words.
2. **If something looks wrong (id `help`):** recheck the pack and text; check the manufacturer's official information; FSSAI helpline 1800-112-100 (24x7); Food Safety Connect link; National Consumer Helpline 1915; FoSCoS FBO Search for licence numbers. Line: "FoodCheck does not report anything for you."

Do not add home-test steps unless taken from an FSSAI source you have opened and cited.

### 4.8 History (P1)
List of the last 50 scans on this device: product name, barcode, classification label (icon + text), date. Stored in `localStorage` (try/catch). "Clear history" button. Empty state explains scans are saved only on this device. Use clearly labelled placeholder names in screenshots.

### 4.9 About
What FoodCheck does and does not do; data sources with links (Open Food Facts, FSSAI regulations); privacy notice (photos stay on the device, nothing personal collected, history stays on the device); "Prototype v1.0 built for a college Community Engagement Project"; contact line for feedback.

## 5. Components

`Header`, `TabBar`, `StepProgress`, `Footer`, `BarcodeScanner`, `BarcodeInput`, `ProductCard`, `ImagePicker`, `OcrProgress`, `TextReview`, `ConfidenceLabel`, `FindingCard`, `ClassificationBadge`, `ResultRow`, `ErrorBanner`, `Loading`, `HelpLinks`.

## 6. Interactions and feedback

- Every async action shows a loading state; OCR shows a progress bar and never freezes the page.
- Errors are inline or in a banner, announced to screen readers (`role="alert"`), and always offer a next action.
- Buttons are disabled while their action is running to prevent double submits.
- Scroll to top on route change; move focus to the page heading.
- Short transitions only (150-200 ms); respect `prefers-reduced-motion`.

## 7. Responsive behaviour

- Under 640 px: single column, bottom tab bar.
- 640 px and above: centred column; the Result page shows Observed and Reference side by side.
- No horizontal scrolling at 320 px.

## 8. Accessibility checklist

- Labels on every input; descriptive button text.
- Visible focus ring; full keyboard navigation; scanner always has a typed alternative.
- Images have alt text; decorative icons are hidden from screen readers.
- Status communicated by icon + text + position, not colour alone.
- Language attribute set; text can scale to 200% without breaking layout.

## 9. Microcopy rules

### 9.1 Banned anywhere in the UI, code, tests and sample data
SAFE, UNSAFE, VERIFIED, GENUINE, FAKE, ADULTERATED, "FSSAI Approved", "No Risk Detected", "Adulteration Risk Detected", "Safe & Verified", any score or percentage of safety. Do not name real brands in sample data.

### 9.2 Replacements for the concept image

| Concept image | Use |
|---|---|
| SAFE & VERIFIED banner | Consistent with available records + "This does not confirm the product is genuine or safe." |
| Authenticity: Genuine Brand | Product record: Found in Open Food Facts / Not found |
| Adulteration Risk: No Risk Detected | Ingredient list: Consistent / Potential discrepancy / Insufficient evidence |
| Regulatory Status: FSSAI Approved | FSSAI licence no.: format OK, check on FoSCoS (P1) |
| Expiry Date: Not Expired | Omitted in P0; later "Expiry date (typed from the pack)" |
| Red "Adulteration Risk Detected" | Never shown |
| "Cross-check with official databases (FSSAI)" | "Compared with Open Food Facts (community data)" |
| "Check authenticity (genuine or fake)" | "Compare label with database record" |
| "Good morning, Raj!" | Static tagline |
| Profile, Community Insights, Report Concern (submit) | Removed; Guide / Official help channels instead |

### 9.3 Classification copy

| Label | Short explanation |
|---|---|
| Consistent with available records | No material difference was found in what was compared. |
| Potential discrepancy | The label text and the record differ. This can be caused by a recipe change, a regional version, an outdated record or a reading error. Please re-check. |
| Insufficient evidence | There is not enough reliable information to compare. |

## 10. Design assets to produce

Logo (SVG), favicon and PWA icons, 3 classification icons, empty-state illustration (optional), screenshots of every screen for the report (use placeholder product names).

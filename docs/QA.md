# Verification — October 6, 2026

## Browser checks

- Desktop (1440 × 1000): homepage, featured display, catalog, NOVA project, local image loading and horizontal-overflow check.
- Tablet (768 × 1024): homepage composition and horizontal-overflow check.
- Mobile (390 × 844): every published project route; no page-level horizontal overflow and no missing sourced images. Header, collection filters and media checked.
- Narrow mobile (320 × 740): homepage and NOVA detail; no page-level horizontal overflow. Gallery overlay fits and controls remain usable.
- Filters: Published → 1 result; Private source → 3; Public source → 4; reset → 7.
- Alias search: `muslim` finds Qurani. An unmatched search shows the empty state; reset restores all results.
- Gallery: opens, advances, keyboard right-arrow advances, Escape closes, focus returns to its opening control.
- Video: NOVA's existing public walkthrough reached readyState 4 and played beyond 29 seconds; duration 49.93 seconds; no media error.
- Reduced motion is explicitly supported in CSS; native scroll, keyboard focus outlines and semantic links/buttons are preserved.
- Caching issue found during preview was fixed with content-versioned CSS and JavaScript URLs.

## Automated checks

`npm test` verifies required visible-project fields, evidence, source labeling, hidden-page exclusion, local images, generated routes, one page heading and description metadata. JavaScript syntax checked with Node. All 21 external project/store/APK/proof links returned HTTP 200 at review time; results are in `docs/link-check.json`.

The checks cover the website, not the internal behavior or current CI health of the showcased Flutter apps. Store listing artwork can represent later releases by other teams. No actual purchases or account operations were performed.

## Website project manager — 2026-10-06

- Browser UI checked at desktop 1440×900 and mobile 390×844; no horizontal overflow. Existing published records and hidden editorial drafts render correctly.
- Created a local test project, typed its name character by character, uploaded two real WebP screenshots, reordered them and checked the card preview. New image preparation stayed local until publish.
- Incomplete visible projects were rejected with specific missing-field messages. Session connection instructions appeared before saving without authentication.
- Imported a JSON draft with a new hidden record and confirmed catalog counts, search and change tracking. Selecting an existing hidden record does not mark default fields as editorial changes.
- Real GitHub API smoke test used a temporary branch: one atomic commit saved the catalog plus image bytes; rereading verified both; stale catalog publication was rejected. Main stayed unchanged and the test branch was removed.
- `npm test` passes catalog/routes/assets and manager adapter/conflict/type-validation/session-clearing checks. The Pages and quality workflows passed for the manager foundation commit.
- Draft download uses the normal browser Blob/download flow; the in-app browser's automation did not return a download event, so downloaded-file verification was unavailable there.

- Final browser connection check rejected a dummy token with GitHub’s translated 401 response. Fixed native browser `fetch` receiver binding and added a regression test; unauthenticated catalog loading now uses the API correctly. Editor controls stay disabled during initial loading.

## MyShop addition — 2026-10-07

- Catalog → generated pages → browser flow verified: MyShop is the eighth visible project, appears through its `My Shop` search alias and Public source filter, and opens its own detail route. The four Featured projects remain unchanged.
- Desktop 1440×1000 and mobile 390×844 checked for hero layout, links, sourced images and gallery controls. No page-level horizontal overflow or broken sourced images. The mobile screenshot dialog fits inside the viewport; advancing and closing work.
- Eight actual simulator captures are served as local WebP files. No generated or redrawn app screens. The source commit and recording provenance are documented in `RESEARCH.md`.
- The public walkthrough played in the browser with readyState 4, no media error and a duration of 28.6 seconds (rounded to 29 in the caption).
- The ARM64 Android demo download returned HTTP 200 with the expected APK content type and 24,996,328-byte size. The project presentation also returned HTTP 200.
- Content explicitly identifies the development-branch version, demo orders and virtual MyFatoorah Sandbox payment. Website verification does not establish real-device payment acceptance; no payment or account action was performed.
- `npm run build` and `npm test` pass for 8 visible / 7 hidden projects and the manager checks. Review dates now come from each project's catalog record.

## Etzan addition — October 8, 2026

Build and catalog/generated-route validation passed (9 visible projects, 7 hidden drafts); existing manager publication tests passed. Verified unchanged screenshot hashes. Browser review at desktop, 390px and 320px: no document overflow. Arabic search `اتزان` returns one canonical entry. Screenshot viewer opens, advances from 1/7 to 2/7 and closes. Presentation and APK links returned HTTP 200. Android installation and live backend behavior were not tested.

## Mahami native exhibit — October 8, 2026

Build, generated-route/evidence checks (10 visible, 7 hidden) and existing manager publication tests passed. Eight original Android screenshot hashes match the pinned source; the two portfolio images match the same originals. Browser review: desktop 1280px and mobile 390px/320px; native detail and collection had no document overflow. Native filter returns one project; Arabic `مهامي` search and filter survive reload through URL state. Image viewer opens at 1/8, advances to 2/8 and closes. Native stack labels and Android capture provenance are visible. Native app runtime, device/cloud acceptance and Figma screen fidelity were not tested in this website task; the project page attributes recorded app checks to its own source notes.

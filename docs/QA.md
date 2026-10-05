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

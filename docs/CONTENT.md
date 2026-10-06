# Add projects from the website

The Arabic manager at https://husseinabozina.github.io/app-showroom/admin/ provides project editing, image uploads, draft export/import and publication. See [ADMIN.md](ADMIN.md) for connection and publishing instructions. The same catalog can also be edited directly as described below.

# Maintaining the collection

Edit `content/projects.json`, run `npm run build`, then `npm test`. The site has no database, service keys or required runtime dependencies. Commit the catalog AND generated `dist` output together.

## Everyday edits

- Add: copy a visible record, assign a unique lowercase `slug`, and replace its facts, images and links.
- Edit: change the existing record. Keep its slug stable to preserve links.
- Hide: set `visible: false`. Rebuilding removes its page and excludes it from navigation, featured work and search.
- Reorder: change numeric `order`; smaller numbers appear first.
- Feature: set `featured: true`. Provide at least two screenshots. The featured section updates its count automatically.
- Images: add files under `dist/assets/<slug>/`. Use WebP; keep image widths under 1000px when practical. Add `src`, `alt` and `caption` records to `screens`.
- Video: add `video: {"src": "https://…", "caption": "What this recording shows"}`. Omit it when there is no recording. Videos load only on demand.
- Links: each has a readable `label`, HTTPS `url`, and `kind` (`source`, `presentation`, `store`, `apk`, or `proof`). Omit missing links; never render an inert button.
- Appearance: `color` and `ink` control the project's display surface. The layout remains cohesive without one-off page redesigns.

## Evidence contract

Every visible record requires `evidence`, `verifiedAt`, a role, contributions and a candid scope/status boundary. `status` and `source` are separate dimensions. An app with a public presentation repository can still have **Private source**.

A store listing verifies publication, not personal ownership of every feature. Never attribute another team's later work to Hussein. Never infer production from a repo, APK or screenshots. Preserve original UI-kit credits. Link to live CI evidence rather than inventing passing-test counts or production-quality guarantees.

`aliases` group repository names into one canonical product and support search. They do not make each repository a separate app. Hidden records are editorial drafts, not publishable project descriptions.

The home page's “20+ applications” and “~5 years” come from Hussein's brief; the selected collection is a smaller evidence-backed subset.

## Files

- `content/projects.json`: authoritative editorial data.
- `scripts/build.mjs`: static page templates.
- `dist/styles.css`: shared visual system and responsive rules.
- `dist/app.js`: progressive-enhancement search, filters and accessible gallery dialog.
- `scripts/validate.mjs`: checks publication contracts, local references and hidden routes.

All content and navigation remain readable without JavaScript. Filters and the enlarged screenshot dialog require JavaScript. Search matches titles, categories, status, source labels and known repository aliases. Query/filter state is retained in the URL.

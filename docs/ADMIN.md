# Website project manager

Open **https://husseinabozina.github.io/app-showroom/admin/**, or use “إدارة المشاريع” in the site footer.

The manager supports adding/editing projects, completing existing hidden drafts, visibility, Featured, numeric ordering, contributions, product flows, engineering notes, screenshot uploads with captions and ordering, video URLs, proof/store/APK/source links and a card preview. It preserves the existing structured catalog and all public case-study templates.

## Connect once per session

Create a fine-grained GitHub personal access token for **Husseinabozina/app-showroom only**, with **Contents: Read and write**. Enter it in the connection dialog. Only Husseinabozina's account with repository push access is accepted. The token is held in private JavaScript memory, sent only to `api.github.com`, and never placed in source, logs, browser storage, URLs or exported drafts. Disconnect or closing/reloading the page clears it.

This is a browser-to-GitHub connection, not a password login or an OAuth app. Public visitors can inspect the editor but cannot save without the owner's authorized token. No secret is bundled with the website.

Reference: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

## Add and publish

1. Choose “إضافة مشروع”. Fill the product facts and your personal role.
2. Upload screenshots and edit their captions/descriptions. The browser resizes/encodes them as WebP; uploads happen only when publishing.
3. Add product flows, engineering notes and proof/store/source links. Optional sections can stay empty.
4. Turn on “ظاهر في المعرض” when the project is ready. Featured requires at least two images.
5. Review the card and press “حفظ ونشر التغييرات”. The review dialog lists every changed project and new image count.
6. Confirm. One Git commit saves the catalog and image files together. The existing Pages workflow builds, validates, stores generated pages and deploys. The manager reports the deployment's status and links to the exact commit/workflow.

Closing an unsaved page triggers the browser's normal leave warning. You can export/import a local draft including pending image bytes. The export contains no token. Drafts are not stored automatically or sent anywhere before publish.

## Concurrent edits and failures

The manager compares the original catalog blob SHA with the latest branch before saving. A changed catalog stops publication without overwriting it. Generated-page-only changes do not conflict with an unchanged catalog. The final branch update uses `force: false`, so an intervening branch change is rejected rather than overwritten.

Images are written as Git blobs and included in the same tree/commit as the catalog. Failed writes before the branch update do not alter live content. Every uploaded image gets a unique file path. Removing a screenshot removes the catalog reference but leaves the old file for recovery. Publication errors keep local edits in the open page. If the post-commit refresh fails, the already-saved commit is reported and another connection is required before further publishing.

Limits: 30 images/links/items per section; originals up to 25 MB; encoded images up to 4 MB each; up to 16 MB of new encoded images per publication. Video uses a hosted HTTPS MP4 URL. Existing APK/store links remain regular URLs.

## Development

- `dist/admin/core.js`: data validation and atomic GitHub publishing client.
- `dist/admin/manager.js`: Arabic editor, session connection, draft backup, image preparation and deployment status.
- `dist/admin/manager.css`: responsive manager styling.
- `scripts/build.mjs`: keeps the public catalog snapshot and manager asset versions aligned.
- `scripts/admin.test.mjs`: meaningful adapter, conflict, source-label and upload validation checks.

The manager writes `content/projects.json` and new `dist/assets/…` files. Pages' GitHub Actions job regenerates pages and commits only `dist` when needed. Its bot commit does not recursively trigger another workflow. The build job needs `contents: write` for this generated-output commit; the deploy job retains Pages/OIDC permissions.
